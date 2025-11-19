import { Prisma, PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { drawTable } from "pdf-lib-draw-table-beta";
import { getPriceForDuration } from "@/app/_utils/priceCalc/index.js";

const prisma = new PrismaClient();

const getTransactionDetails = async (orderID: string) => {
  // find file by filehash and orderID
  return prisma.transcriptionOrder.findUnique({
    where: {
      paypalOrderId: orderID,
      paypalOrderStatus: "COMPLETED",
    },
    select: {
      paypalOrderInfo: true,
      files: true,
    },
  });
};

export async function GET(incoming_request: NextRequest) {
  try {
    const orderID = incoming_request.nextUrl.searchParams.get(
      "orderID",
    ) as string;
    const order = await getTransactionDetails(orderID);

    // Check if the order is NULL
    if (!order) {
      // If order is NULL, throw a new error indicating the issue
      return new Response(
        "Invoice could not be created because order details were not found.",
        { status: 400 },
      );
    }
    const invoice = await createInvoice(order);

    return new Response(invoice, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("The following error occured: ", err);
    // Handle the new error message specifically
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

// This function receives all the order infos and created an invoice based on that
// The invoice is created with pdfmake

async function createInvoice(order: any) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold_font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 10;
  const lineGap = 3.5; // Gap between lines
  const companyInfo = [
    process.env.INVOICE_COMPANY_NAME || "Company Name",
    process.env.INVOICE_COMPANY_SUFFIX || "Services",
    process.env.INVOICE_STREET || "Street Address",
    process.env.INVOICE_CITY || "City, Zip",
    process.env.INVOICE_EMAIL || "contact@example.com",
  ];
  const dateTime =
    order.paypalOrderInfo.purchase_units[0].payments.captures[0].create_time; // "2024-02-16T20:56:29Z"
  const totalOrderValue =
    order.paypalOrderInfo.purchase_units[0].payments.captures[0].amount.value;
  const currency_code =
    order.paypalOrderInfo.purchase_units[0].payments.captures[0].amount
      .currency_code;
  const invoiceDetails = [
    `Date: ${dateTime.slice(0, 10)}`,
    `Invoice Number: ${order.paypalOrderInfo.id}`,
  ];
  const customerInfo = [
    order.paypalOrderInfo.purchase_units[0].shipping.name.full_name,
    order.paypalOrderInfo.purchase_units[0].shipping.address.address_line_1,
    order.paypalOrderInfo.purchase_units[0].shipping.address.postal_code +
    " " +
    (order.paypalOrderInfo.purchase_units[0].shipping.address.admin_area_1 ||
      order.paypalOrderInfo.purchase_units[0].shipping.address.admin_area_2),
  ];
  const taxInfo = [
    "VAT Exemption Note: According to § 19 UStG, no VAT is charged.",
    "Unless otherwise stated, the delivery/service date corresponds to the invoice date.",
  ];
  const footer = [
    "Thank you for your order and using our service!",
    "Your transcrAIbe team.",
  ];
  const sanitizeFileName = (filename: string) => {
    // Define a replacement for unsupported characters
    const replacementChar = "";
    // Define a regex pattern for allowed characters. Adjust according to your needs.
    // This pattern allows letters, numbers, spaces, underscores, and hyphens.
    // Add or remove characters from the regex as needed.
    const allowedChars = /^[a-zA-Z0-9 _.-]+$/;

    // Replace unsupported characters with a predefined character
    let sanitizedFilename = filename
      .split("")
      .map((char) => (allowedChars.test(char) ? char : replacementChar))
      .join("");

    // Check if the sanitized filename is longer than 10 characters, and if so, truncate it
    if (sanitizedFilename.length > 26) {
      sanitizedFilename = sanitizedFilename.substring(0, 26);
    }

    return sanitizedFilename;
  };

  const tableData = [
    [
      "Length",
      "File Name",
      "Service",
      `Unit Price in ${order.paypalOrderInfo.purchase_units[0].payments.captures[0].amount.currency_code}`,
    ],
  ];

  const files = order.files; // This should be an array of files

  // Dynamically add a row for each file
  files.forEach((file: { playbackSeconds: any; filename: string }) => {
    //const quantity = "1"; // Static example quantity
    const description = "Audio Transcription"; // Static example description
    const length = `${file.playbackSeconds} sec`; // Convert playbackSeconds to string with 'sec' suffix
    const unitPrice = `${getPriceForDuration(file.playbackSeconds).toFixed(2)}`; // Assuming this function exists and calculates price

    // Sanitize filename to remove unsupported characters
    const sanitizedFilename = sanitizeFileName(file.filename);

    // Add the new row to tableData with the sanitized filename
    tableData.push([length, sanitizedFilename, description, unitPrice]);
  });

  let startY = height - 50; // Start Y position of the first line
  companyInfo.forEach((line) => {
    const lineWidth = font.widthOfTextAtSize(line, fontSize);
    const xPosition = width - 50 - lineWidth; // 50 is the right margin
    page.drawText(line, {
      x: xPosition,
      y: startY,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    startY -= fontSize + lineGap; // Move down for the next line
  });

  startY = startY - 20;
  customerInfo.forEach((line) => {
    page.drawText(line, {
      x: 50,
      y: startY,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    startY -= fontSize + lineGap; // Move down for the next line
  });

  startY = startY - 20;
  invoiceDetails.forEach((line) => {
    const lineWidth = font.widthOfTextAtSize(line, fontSize);
    const xPosition = width - lineWidth - 50; // 50 is the right margin
    page.drawText(line, {
      x: xPosition,
      y: startY,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    startY -= fontSize + lineGap; // Move down for the next line
  });

  startY = startY - 50;
  page.drawText("Invoice", {
    x: 50,
    y: startY,
    size: fontSize + 2,
    font: bold_font,
  });

  //Here comes the table
  const options = {
    header: {
      hasHeaderRow: true,
      backgroundColor: rgb(0.9, 0.9, 0.9),
      font: font,
      textSize: fontSize,
    },
    font: font,
    textSize: fontSize,
    border: {
      color: rgb(0, 0, 0),
    },
  };
  try {
    const tableDimensions = await drawTable(
      pdfDoc,
      page,
      tableData,
      50,
      startY - 20,
      options,
    );
    startY = tableDimensions.endY - 40;
  } catch (error) {
    console.log("Error while drawing table", error);
  }

  page.drawText(`Total: ${totalOrderValue} ${currency_code}`, {
    x:
      width -
      50 -
      font.widthOfTextAtSize(
        `Total: ${totalOrderValue} ${currency_code}`,
        fontSize + 2,
      ),
    y: startY,
    size: fontSize + 2,
    color: rgb(0, 0, 0),
  });

  startY = startY - 40;
  taxInfo.forEach((line) => {
    page.drawText(line, {
      x: 50,
      y: startY,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    startY -= fontSize + lineGap; // Move down for the next line
  });

  startY = startY - 30;
  footer.forEach((line) => {
    page.drawText(line, {
      x: 50,
      y: startY,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    startY -= fontSize + lineGap; // Move down for the next line
  });

  page.drawText(`VAT identification number: ${process.env.INVOICE_VAT_ID || "DE000000000"}`, {
    x: 50,
    y: 25,
    size: 8,
  });
  page.drawText(
    `Bank Details: ${process.env.INVOICE_BANK_DETAILS || "Bank Name, IBAN: DE00 0000 0000 0000 0000 00"}`,
    {
      x: 50,
      y: 15,
      size: 8,
    },
  );

  // Serialize the PDFDocument to bytes (a Uint8Array)
  return await pdfDoc.save();
}
