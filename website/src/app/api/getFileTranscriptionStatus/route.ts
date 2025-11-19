// https://copyprogramming.com/howto/javascript-npm-react-paypal-button-v2-nextjs

import { Prisma, PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

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
        },
        select: {
          transcriptionStatus: true,
        },
      },
    },
  });
  console.log("order: \n", order);
  return order;
};

export async function GET(incoming_request: NextRequest) {
  try {
    const filehash = incoming_request.nextUrl.searchParams.get(
      "filehash",
    ) as string;
    const orderID = incoming_request.nextUrl.searchParams.get(
      "orderID",
    ) as string;
    const order = await getOrderWithFilehash(filehash, orderID);
    console.log("file: \n", order);

    const transcriptionStatus = order?.files[0].transcriptionStatus;

    return Response.json({ transcriptionStatus: transcriptionStatus });
  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return new Response("File not found.", { status: 404 });
      }
    }
    return new Response(null, {
      status: 500,
      statusText: "Could not get file transcription status.",
    });
  }
}
