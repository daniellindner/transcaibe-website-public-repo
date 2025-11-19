// https://copyprogramming.com/howto/javascript-npm-react-paypal-button-v2-nextjs

import paypal from "@paypal/checkout-server-sdk";
import client from "@/app/_utils/paypal";
import { PaypalOrderStatus } from ".prisma/client";
import { PrismaClient } from "@prisma/client";
import { FileToTranscribe } from "@/app/_components/FileToTranscribeType";
// @ts-ignore
import { v4 as uuidv4 } from "uuid";
import { getTotalPriceForCart } from "@/app/_utils/priceCalc/index.js";

const prisma = new PrismaClient();

export async function POST(incoming_request: Request) {
  console.log("createOrder");
  const incoming_cart = await incoming_request.json();
  console.log(incoming_cart);

  // validate incoming_request_json / incoming order
  if (incoming_cart.length === 0) {
    const myOptions = { status: 400, statusText: "No files to transcribe." };
    return new Response(null, myOptions);
  }
  if (incoming_cart.length > 20) {
    const myOptions = {
      status: 400,
      statusText: "Maximum of 20 files per order.",
    };
    return new Response(null, myOptions);
  }
  // TODO calculate price

  const PaypalClient = client();
  //This code is lifted from https://github.com/paypal/Checkout-NodeJS-SDK
  const request_to_paypal = new paypal.orders.OrdersCreateRequest();
  request_to_paypal.headers["Prefer"] = "return=minimal";
  request_to_paypal.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "EUR",
          value: getTotalPriceForCart(incoming_cart).toFixed(2),
        },
      },
    ],
  });
  const response = await PaypalClient.execute(request_to_paypal);
  if (response.statusCode !== 201) {
    const myOptions = { status: 500, statusText: "Could not create order." };
    return new Response(null, myOptions);
  }
  // 1st, create order with CREATED status (will be updated to COMPLETED after payment)

  // create files dicts for prisma
  const files = incoming_cart.map((file: FileToTranscribe) => {
    return {
      filename: file.filename.substring(0, 255), // limit string to 255 chars, helps against security attacks to upload arbitrary data
      filehash: file.filehash.substring(0, 255),
      filesize: file.filesize,
      playbackSeconds: file.playbackSeconds,
      blobS3Key: `user-uploads/${uuidv4()}/${file.filehash}`,
    };
  });

  const orderID = response.result.id;
  await prisma.transcriptionOrder.create({
    data: {
      paypalOrderId: orderID,
      paypalOrderStatus: PaypalOrderStatus.CREATED,
      paypalOrderInfo: response.result,
      files: {
        create: [...files],
      },
    },
  });

  console.log("Create order success");
  console.log(response.result);
  return Response.json({ orderID: orderID });
}
