"use client";

import * as React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Dropzone from "react-dropzone";
import { FileToTranscribe } from "@/app/_components/FileToTranscribeType";
import { Box, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { saveAs } from "file-saver";
import { useSearchParams } from "next/navigation";
import Typography from "@mui/material/Typography";

const DragAndDropDataGrid = ({
  getCart,
  updateCart,
  freezeAddedFiles,
  orderInfoLoading,
}: {
  getCart: FileToTranscribe[];
  updateCart: React.Dispatch<React.SetStateAction<FileToTranscribe[]>>;
  freezeAddedFiles: boolean;
  orderInfoLoading: boolean;
}) => {
  const searchParams = useSearchParams();

  function startDownload(file: FileToTranscribe) {
    // get file transcription from db
    const paypalOrderID = searchParams.get("id") as string;
    console.log("paypalOrderID", paypalOrderID);
    console.log("file.filehash", file.filehash);
    fetch(
      "/api/getTranscription?" +
        new URLSearchParams({
          filehash: file.filehash,
          orderID: paypalOrderID,
        }),
      {
        method: "GET",
      },
    )
      .then((response) => response.json())
      .then((response) => {
        console.log("response", response);
        const blob = new Blob([response.transcription], {
          type: "text/plain;charset=utf-8",
        });
        saveAs(blob, file.filename + ".transcription.txt");
      });
  }

  const columns: GridColDef[] = [
    {
      field: "filename",
      headerName: "File Name",
      width: 200,
    },
    {
      field: "filesize",
      headerName: "File Size",
      width: 70,
    },
    {
      field: "playbackSeconds",
      headerName: "Playback Length",
      width: 150,
    },
    {
      field: "deleteRow",
      headerName: "Delete",
      width: 70,
      renderCell: (params) => (
        <IconButton
          aria-label="delete"
          onClick={() => {
            deleteRowFromCart(
              params.row as FileToTranscribe,
              getCart,
              updateCart,
            );
          }}
          disabled={freezeAddedFiles}
        >
          <ClearIcon />
        </IconButton>
      ),
    },
    {
      field: "download",
      headerName: "Download",
      width: 70,
      renderCell: (params) => (
        <IconButton
          aria-label="download"
          onClick={() => {
            const file = params.row;
            startDownload(file as FileToTranscribe);
          }}
          disabled={!freezeAddedFiles}
        >
          <ClearIcon />
        </IconButton>
      ),
    },
  ];

  const deleteRowFromCart = (
    row: FileToTranscribe,
    cart: FileToTranscribe[],
    updateCart: React.Dispatch<React.SetStateAction<FileToTranscribe[]>>,
  ) => {
    const newCart = cart.filter((cartRow) => cartRow.filehash !== row.filehash);
    updateCart(newCart);
  };
  const checkValidFileExtension = (file: File) => {
    // accept only these types File uploads are currently limited to 25 MB and the following input file types are supported: mp3, mp4, mpeg, mpga, m4a, wav, and webm.
    const validFileExtensions = [
      "mp3",
      "mp4",
      "mpeg",
      "mpga",
      "m4a",
      "wav",
      "webm",
    ];
    const fileExtension = file.name.split(".").pop();
    return validFileExtensions.includes(fileExtension as string);
  };

  const hashFile = (file: File): Promise<string> => {
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

  const getAudioPlayTime = (file: File): Promise<number> => {
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

  const onDrop = async (acceptedFiles: File[]) => {
    console.log("acceptedFiles", acceptedFiles);
    const existingHashes = new Set(getCart.map((row) => row.filehash));
    const fileCheckPromises = acceptedFiles.map(async (file) => {
      // file hashes
      const hash = await hashFile(file);
      if (!existingHashes.has(hash) && checkValidFileExtension(file)) {
        existingHashes.add(hash);

        return {
          filename: file.name,
          filesize: file.size,
          filehash: hash,
          playbackSeconds: await getAudioPlayTime(file),
          file: file,
        };
      }

      return null;
    });

    const newRows = (await Promise.all(fileCheckPromises)).filter(
      (row): row is FileToTranscribe => row !== null,
    ); // This line filters out null values

    updateCart([...getCart, ...newRows]);
  };

  return (
    <React.Fragment>
      <Dropzone
        onDrop={(acceptedFiles) => onDrop(acceptedFiles)}
        disabled={freezeAddedFiles}
        noClick
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <div style={{ height: "45vh", width: "100%" }}>
              <DataGrid
                rows={getCart}
                columns={columns}
                initialState={{}}
                // pageSizeOptions={[5, 10, 25, 100]}
                checkboxSelection={false}
                disableRowSelectionOnClick
                getRowId={(row) => row.filehash}
                loading={orderInfoLoading}
                components={{
                  NoRowsOverlay: () => (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      // minHeight="100vh"
                      height={"100%"}
                    >
                      <Typography variant="h6">
                        Drag and drop files here to add them to your cart.
                      </Typography>
                    </Box>
                  ),
                }}
              />
            </div>
          </div>
        )}
      </Dropzone>
    </React.Fragment>
  );
};
export default DragAndDropDataGrid;
