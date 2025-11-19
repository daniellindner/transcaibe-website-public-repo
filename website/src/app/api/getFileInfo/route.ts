// https://copyprogramming.com/howto/javascript-npm-react-paypal-button-v2-nextjs

import { Prisma, PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(incoming_request: NextRequest) {
  // API key should be stored in .env
  const api_key = incoming_request.headers.get("api_key");
  if (api_key !== process.env.AWS_API_KEY) {
    return new Response("Invalid api_key.", { status: 401 });
  }

  const s3key = incoming_request.nextUrl.searchParams.get(
    "blobS3Key",
  ) as string;
  if (!s3key) {
    return new Response("Request must include blobS3Key parameter.", {
      status: 400,
    });
  }

  try {
    // get files info by s3key
    const file = await prisma.file.findUniqueOrThrow({
      where: {
        blobS3Key: s3key,
      },
      select: {
        filename: true,
        filehash: true,
        filesize: true,
        playbackSeconds: true,
        blobS3Key: true,
        transcriptionStatus: true,
        transcriptionOrder: {
          select: {
            paypalOrderStatus: true,
          },
        },
      },
    });
    return Response.json(file);
  } catch (e) {
    // Catch unexpected errors
    console.log(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        return new Response(`No file with s3key: ${s3key} found.`, {
          status: 404,
        });
      }
    }
    return new Response("Internal server error.", { status: 500 });
  }
}
