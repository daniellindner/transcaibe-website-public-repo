// https://copyprogramming.com/howto/javascript-npm-react-paypal-button-v2-nextjs

import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function POST(incoming_request: NextRequest) {
  try {
    const incoming_analytics = await incoming_request.json();
    console.log(incoming_analytics);

    // check that the incoming request has the required fields
    if (!incoming_analytics.sessionId) {
      return new Response(null, { status: 400, statusText: "No session_id." });
    }
    if (!incoming_analytics.event_name) {
      return new Response(null, { status: 400, statusText: "No event_name." });
    }
    if (!incoming_analytics.quantity) {
      return new Response(null, { status: 400, statusText: "No quantity." });
    }

    // create the analytics event in the database
    const analytics_event = await prisma.userTracking.create({
      data: {
        sessionId: incoming_analytics.sessionId,
        event_name: incoming_analytics.event_name,
        quantity: incoming_analytics.quantity,
      },
    });

    console.log(analytics_event);

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (err) {
    console.error(err);

    return new Response(null, {
      status: 500,
      statusText: "Could not get file transcription.",
    });
  }
}
