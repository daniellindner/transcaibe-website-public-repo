// https://copyprogramming.com/howto/javascript-npm-react-paypal-button-v2-nextjs

import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(incoming_request: NextRequest) {
  const orderID = incoming_request.nextUrl.searchParams.get(
    "orderID",
  ) as string;
  // sleep for 3 second to give paypal time to update order status
  // await new Promise(resolve => setTimeout(resolve, 3000));
  try {
    const order = await prisma.transcriptionOrder.findUnique({
      where: {
        paypalOrderId: orderID,
      },
      select: {
        paypalOrderId: true,
        paypalOrderStatus: true,
        files: {
          select: {
            filename: true,
            filehash: true,
            filesize: true,
            playbackSeconds: true,
            blobS3Key: true,
          },
        },
      },
    });
    if (!order) {
      return Response.json({}); // empty response, no order found
    }
    return Response.json(order);
  } catch (err) {
    console.error(err);
    return new Response(null, {
      status: 500,
      statusText: "Could not get order info.",
    });
  }
}
