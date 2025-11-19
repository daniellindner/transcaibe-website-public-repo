// https://copyprogramming.com/howto/javascript-npm-react-paypal-button-v2-nextjs

import { PrismaClient, TranscriptionStatus } from "@prisma/client";
import {
  formatFailedTranscriptionForTelegram,
  sendMessageToMyPhone,
} from "@/app/_utils/telegram_monitor/telegram_bot";

const prisma = new PrismaClient();

export async function POST(incoming_request: Request) {
  // API key should be stored in .env
  const api_key = incoming_request.headers.get("api_key");
  if (api_key !== process.env.AWS_API_KEY) {
    return new Response("Invalid api_key.", { status: 401 });
  }

  const body = await incoming_request.json();
  if (!body) {
    return new Response("Request must include json body.", { status: 400 });
  }
  console.log("updateTranscription called with body: \n", body);

  try {
    // check file transcription status
    let transcriptionStatus: TranscriptionStatus;
    switch (body.transcriptionStatus) {
      case "NOT_STARTED": {
        transcriptionStatus = TranscriptionStatus.NOT_STARTED;
        break;
      }
      case "IN_PROGRESS": {
        transcriptionStatus = TranscriptionStatus.IN_PROGRESS;
        break;
      }
      case "FAILED": {
        transcriptionStatus = TranscriptionStatus.FAILED;
        break;
      }
      case "COMPLETED": {
        transcriptionStatus = TranscriptionStatus.COMPLETED;
        // update transcription status and addionally transcription text and transcriptionBlobS3Key
        await prisma.file.update({
          where: {
            blobS3Key: body.blobS3Key,
          },
          data: {
            transcriptionStatus: transcriptionStatus,
            transcriptionText: body.transcriptionText,
            transcriptionBlobS3Key: body.transcriptionBlobS3Key,
          },
        });
        break;
      }
      default: {
        return new Response("Invalid transcriptionStatus.", { status: 400 });
      }
    }

    // update file transcription status if it's not COMPLETED
    const updated_file = await prisma.file.update({
      where: {
        blobS3Key: body.blobS3Key,
      },
      data: {
        transcriptionStatus: transcriptionStatus,
      },
    });

    if (transcriptionStatus == TranscriptionStatus.FAILED) {
      // send telegram message for monitoring
      const telegram_msg = formatFailedTranscriptionForTelegram(updated_file);
      console.log("telegram_msg: \n", telegram_msg);
      sendMessageToMyPhone(telegram_msg);
    }
  } catch (e) {
    // Catch unexpected errors
    console.log(e);
    return new Response("Error updating transcription.", { status: 500 });
  }

  return new Response("Transcription updated.", { status: 201 });
}
