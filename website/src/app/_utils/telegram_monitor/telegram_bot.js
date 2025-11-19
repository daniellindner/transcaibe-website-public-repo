import TelegramBot from "node-telegram-bot-api";

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = token ? new TelegramBot(token) : null;

// Function to send message to your own phone
export const sendMessageToMyPhone = (message) => {
  if (!bot) {
    console.warn("Telegram bot token not set. Skipping message.");
    return;
  }
  // replace 'YOUR_CHAT_ID' with your own chat id
  const chatIds = process.env.TELEGRAM_CHAT_IDS
    ? process.env.TELEGRAM_CHAT_IDS.split(",")
    : [];

  chatIds.forEach((chatId) => {
    try {
      bot.sendMessage(chatId.trim(), message, { parse_mode: "HTML" });
    } catch (error) {
      console.error(`Failed to send message to chat ID ${chatId}: ${error}`);
    }
  });
};

export const formatPaypalDataForTelegram = (data) => {
  const eventType = data.status; // Type of Event
  const amountPaid = data.purchase_units[0].payments.captures[0].amount.value; // Amount Paid
  const currency =
    data.purchase_units[0].payments.captures[0].amount.currency_code; // Currency
  const email = data.payment_source.paypal.email_address; // Email Address
  const name = `${data.payment_source.paypal.name.given_name} ${data.payment_source.paypal.name.surname}`; // Name of buyer
  const country = data.payer.address.country_code; // Country of the payer

  // Format the data into a string
  return (
    `<b> ✅ Order Completed</b>\n` +
    `<pre>Event Type:       ${eventType}\n` +
    `Amount Paid:      ${amountPaid} ${currency}\n` +
    `Email Address:    ${email}\n` +
    `Name:             ${name}\n` +
    `Country:          ${country}</pre>`
  );
};

export const formatFailedTranscriptionForTelegram = (data) => {
  const filename = data.filename; // Name of the file
  const filesize = data.filesize; // Size of the file
  const createdAt = data.createdAt; // When the file was created
  const transcriptionStatus = data.transcriptionStatus; // Status of the transcription
  const orderId = data.transcriptionOrderId; // Order ID
  const playbackSeconds = data.playbackSeconds; // Playback time in seconds
  const fileId = data.id; // File ID

  // Format the data into a string
  return (
    `<b> ‼️ Transcription Failed</b>\n` +
    `<pre>Filename:             ${filename}\n` +
    `Filesize:             ${filesize} bytes\n` +
    `Created At:           ${createdAt}\n` +
    `Transcription Status: ${transcriptionStatus}\n` +
    `Playback Time:        ${playbackSeconds} seconds\n` +
    `File ID:              ${fileId}\n` +
    `Order ID:             ${orderId}</pre>`
  );
};
