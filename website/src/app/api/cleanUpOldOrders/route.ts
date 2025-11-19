import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const date = new Date();
    date.setHours(date.getHours() - 48);

    await prisma.transcriptionOrder.deleteMany({
      where: {
        createdAt: {
          lt: date,
        },
      },
    });

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(null, { status: 500 });
  }
}
