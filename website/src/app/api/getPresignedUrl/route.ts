// https://copyprogramming.com/howto/javascript-npm-react-paypal-button-v2-nextjs

import { File, PaypalOrderStatus } from ".prisma/client";
import { PrismaClient, TranscriptionStatus } from "@prisma/client";
import { S3Client } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";
import { NextRequest } from "next/server";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { Conditions } from "@aws-sdk/s3-presigned-post/dist-types/types";

const prisma = new PrismaClient();

const REGION = "eu-central-1";
const BUCKET = process.env.AWS_UPLOAD_BUCKET || "no-bucket-defined";

interface PresignedUrlConfig {
  key: string;
  filesize: number;
  filehash: string;
}

const createPresignedPostWithClient = async ({
  key,
  filesize,
  filehash,
}: PresignedUrlConfig) => {
  const client = new S3Client({
    region: REGION,
    credentials: fromEnv(),
  });
  const conditions = [
    ["content-length-range", filesize, filesize] as Conditions, // only allow files with exact filesize
  ];
  const { url, fields } = await createPresignedPost(client, {
    Bucket: BUCKET,
    Conditions: conditions,
    //Seconds before the presigned post expires. 3600 by default.
    Expires: 600,
    Key: key,
  });
  return { fields: fields, url: url, filehash: filehash };
};

const getFilesForOrderByOrderID = async (orderID: string) => {
  const order = await prisma.transcriptionOrder.findUnique({
    where: {
      paypalOrderId: orderID,
      paypalOrderStatus: PaypalOrderStatus.COMPLETED, // only get files that have been paid for
    },
    include: {
      files: {
        where: {
          transcriptionStatus: TranscriptionStatus.NOT_STARTED, // only get files that have not been transcribed yet (not uploaded to s3 yet
        },
      },
    },
  });

  return order?.files || [];
};

export async function GET(incoming_request: NextRequest) {
  const orderID = incoming_request.nextUrl.searchParams.get(
    "orderID",
  ) as string;
  const files = await getFilesForOrderByOrderID(orderID);
  console.log("files: \n", files);
  try {
    // get s3 keys for files for requested order id from db
    const uriPromises = files.map((file: File) => {
      return createPresignedPostWithClient({
        key: file.blobS3Key as string,
        filesize: file.filesize as number,
        filehash: file.filehash as string,
      });
    });

    const uris = await Promise.all(uriPromises);

    return Response.json({ urls: uris });
  } catch (err) {
    console.error(err);
    return new Response(null, {
      status: 500,
      statusText: "Could not create pre-signed urls.",
    });
  }
}
