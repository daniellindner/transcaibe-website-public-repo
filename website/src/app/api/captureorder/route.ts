// https://copyprogramming.com/howto/javascript-npm-react-paypal-button-v2-nextjs

import client from "@/app/_utils/paypal";
import paypal from "@paypal/checkout-server-sdk";
import { OrdersCapture } from "@paypal/checkout-server-sdk/lib/orders/lib";
import { PaypalOrderStatus } from ".prisma/client";
import { PrismaClient } from "@prisma/client";
import {
  formatPaypalDataForTelegram,
  sendMessageToMyPhone,
} from "@/app/_utils/telegram_monitor/telegram_bot";

const prisma = new PrismaClient();

// import prisma from 'lib/prisma'

export async function POST(incoming_request: Request) {
  //Capture order to complete payment
  console.log("captureOrder");
  const incoming_request_json = await incoming_request.json();
  console.log(incoming_request_json);
  const orderID = incoming_request_json.orderID as string;

  console.log("captureOrder, id:");
  console.log(orderID);
  const PaypalClient = client();
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody(<OrdersCapture.RequestData>{});
  const response = await PaypalClient.execute(request);
  if (!response) {
    const myOptions = { status: 500, statusText: "Could not capture order.!" };
    return new Response(null, myOptions);
  }
  // Create TranscriptionOrder in database
  console.log(response.result);
  if (response.result.status == "COMPLETED") {
    // send telegram message for monitoring completed orders
    const telegram_msg = formatPaypalDataForTelegram(response.result);
    sendMessageToMyPhone(telegram_msg);

    await prisma.transcriptionOrder.update({
      where: {
        paypalOrderId: orderID,
      },
      data: {
        paypalOrderId: orderID,
        paypalOrderStatus: PaypalOrderStatus.COMPLETED,
        paypalOrderInfo: response.result,
      },
    });

    return Response.json({ ...response.result });
  } else {
    const myOptions = { status: 500, statusText: "Order not completed." };
    return new Response(null, myOptions);
  }
}
