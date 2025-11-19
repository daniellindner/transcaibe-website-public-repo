// https://copyprogramming.com/howto/javascript-npm-react-paypal-button-v2-nextjs

import { Prisma, PrismaClient, TranscriptionStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { DownloadFileType } from "@/app/_utils/fileHandling/index.js";
import {
  Document,
  ExternalHyperlink,
  Footer,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

const prisma = new PrismaClient();

const getOrderWithFilehash = async (filehash: string, orderID: string) => {
  // find file by filehash and orderID
  const order = await prisma.transcriptionOrder.findUnique({
    where: {
      paypalOrderId: orderID,
    },
    select: {
      files: {
        where: {
          filehash: filehash,
          transcriptionStatus: TranscriptionStatus.COMPLETED, // only get files that have been transcribed
        },
        select: {
          filename: true,
          transcriptionStatus: true,
          transcriptionText: true,
        },
      },
    },
  });
  console.log("order: \n", order);
  return order;
};

const generateDocx = async (transcription: string) => {
  const footer = new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: "Transcription created with ",
            size: 20, // This sets the font size to 10 points
            font: "Helvetica",
          }),
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: "www.transcraibe.de",
                size: 20,
                font: "Helvetica",
              }),
            ],
            link: "https://www.transcraibe.de/",
          }),
        ],
        alignment: "center",
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: transcription,
                size: 24, // This sets the font size to 12 points
                font: "Helvetica",
              }),
            ],
            alignment: "both",
            spacing: {
              line: 276, // This sets the line spacing to 1.15
            },
          }),
        ],
        footers: {
          default: footer,
        },
      },
    ],
  });

  return Packer.toBlob(doc).then((blob) => {
    console.log(blob);
    return blob;
  });
};

export async function GET(incoming_request: NextRequest) {
  try {
    const filehash = incoming_request.nextUrl.searchParams.get(
      "filehash",
    ) as string;
    const orderID = incoming_request.nextUrl.searchParams.get(
      "orderID",
    ) as string;
    const fileType = incoming_request.nextUrl.searchParams.get(
      "fileType",
    ) as DownloadFileType;
    const order = await getOrderWithFilehash(filehash, orderID);
    console.log("file: \n", order);

    const rawTranscriptionText = order?.files[0].transcriptionText;

    // check if file has been transcribed
    if (!rawTranscriptionText) {
      return new Response("File not transcribed yet.", { status: 404 });
    }

    if (fileType === DownloadFileType.TXT) {
      return Response.json({ transcription: rawTranscriptionText });
    }
    if (fileType === DownloadFileType.WORD) {
      const docx = await generateDocx(rawTranscriptionText);
      return new Response(docx, {
        headers: {
          "content-type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
      });
    }
  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return new Response("File not found.", { status: 404 });
      }
    }
    return new Response(null, {
      status: 500,
      statusText: "Could not get file transcription.",
    });
  }
}
