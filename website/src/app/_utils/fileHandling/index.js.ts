import { FileToTranscribe } from "@/app/_components/FileToTranscribeType";
import { saveAs } from "file-saver";

export const getAudioPlayTime = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = function () {
      window.URL.revokeObjectURL(audio.src);
      resolve(audio.duration);
    };
    audio.onerror = reject;
    audio.src = URL.createObjectURL(file);
  });
};

export const hashFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function () {
      const hashBuffer = crypto.subtle.digest(
        "SHA-256",
        reader.result as BufferSource,
      );
      hashBuffer.then((hash) => {
        const hashArray = Array.from(new Uint8Array(hash));
        const hashHex = hashArray
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        resolve(hashHex);
      });
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const checkValidFileExtension = (file: File) => {
  // accept only these types File uploads are currently limited to 25 MB and the following input file types are supported: mp3, mp4, mpga, m4a, wav, and webm.
  const validFileExtensions = [
    "flac",
    "mp3",
    "mp4",
    "mpga",
    "m4a",
    "ogg",
    "wav",
    "webm",
  ];
  const fileExtension = file.name.split(".").pop();
  return validFileExtensions.includes(fileExtension as string);
};

// DOWNLOAD FILE TYPE OPTIONS ENUM
export enum DownloadFileType {
  TXT = "TXT",
  WORD = "WORD",
}

function wrapText(text: string, maxLineLength: number): string {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    if (
      currentLine.length + word.length + (currentLine.length > 0 ? 1 : 0) <=
      maxLineLength
    ) {
      currentLine += (currentLine.length > 0 ? " " : "") + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  // Add the last line if it's not empty
  if (currentLine !== "") {
    lines.push(currentLine);
  }

  return lines.join("\n");
}

export function startDownload(
  file: FileToTranscribe,
  paypalOrderID: string,
  fileType: DownloadFileType,
) {
  // get file transcription from db
  console.log("paypalOrderID", paypalOrderID);
  console.log("file.filehash", file.filehash);
  console.log("fileType", fileType);
  fetch(
    "/api/getTranscription?" +
      new URLSearchParams({
        filehash: file.filehash,
        orderID: paypalOrderID,
        fileType: fileType,
      }),
    {
      method: "GET",
    },
  ).then((response) => {
    if (fileType === DownloadFileType.TXT) {
      response.json().then((response) => {
        console.log("response", response);
        // wrap text (break into lines) to fit into a page
        const transcription_text = wrapText(response.transcription, 80);
        const blob = new Blob([transcription_text], {
          type: "text/plain;charset=utf-8",
        });
        saveAs(blob, file.filename + ".transcription.txt");
      });
    }
    if (fileType === DownloadFileType.WORD) {
      response.blob().then((blob) => {
        saveAs(blob, file.filename + ".transcription.docx");
      });
    }
  });
}

const uploadFileToS3 = (
  url: string,
  fields: { [key: string]: string },
  file: File,
) => {
  return new Promise<void>((resolve, reject) => {
    const formData = new FormData();
    Object.keys(fields).forEach((key) => {
      formData.append(key, fields[key]);
    });
    // Actual file has to be appended last.
    formData.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.send(formData);
    xhr.onload = function () {
      this.status === 204 ? resolve() : reject(this.responseText);
    };
  });
};

export async function handlePreSignedPostUploadOfFiles(
  paypalOrderID: string,
  cart: FileToTranscribe[],
) {
  // get presigned URLS for each file
  // upload each file to S3
  const presignedURLs = await fetch(
    "/api/getPresignedUrl?" +
      new URLSearchParams({
        orderID: paypalOrderID,
      }),
    {
      method: "GET",
    },
  ).then((response) => response.json());

  // match each file in cart to the presigned URL by their filehash
  const uploadPromises = cart.map((fileToTranscribe) => {
    const presignedURL = presignedURLs.urls.find(
      (presignedURL: { filehash: string }) =>
        presignedURL.filehash === fileToTranscribe.filehash,
    );
    return uploadFileToS3(
      presignedURL.url,
      presignedURL.fields,
      fileToTranscribe.file,
    );
  });
  return Promise.all(uploadPromises);
}

export function downloadInvoice(paypalOrderID: string) {
  fetch(
    "/api/getInvoiceInfo?" +
      new URLSearchParams({
        orderID: paypalOrderID,
      }),
    {
      method: "GET",
    },
  )
    .then((response) => {
      if (response.ok) {
        return response.blob(); // Properly retrieve the blob from the response
      }
      throw new Error("Network response was not ok.");
    })
    .then((blob) => {
      saveAs(blob, "transcrAIbe_invoice.pdf"); // Use the blob to save the file
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error,
      );
    });
}
