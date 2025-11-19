# Speech to Text Frontend

A Next.js application for uploading audio files and viewing transcriptions.

## Getting Started

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in this directory:

   ```bash
   # AWS Configuration (from CDK output)
   AWS_UPLOAD_BUCKET=...
   AWS_REGION=...

   # Security
   AWS_API_KEY=... # Must match the key used in backend deployment

   # PayPal (if using payments)
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...

   # Telegram Monitoring (Optional)
   TELEGRAM_BOT_TOKEN=...
   TELEGRAM_CHAT_IDS=... (comma separated)

   # Invoice Configuration
   INVOICE_COMPANY_NAME=...
   INVOICE_COMPANY_SUFFIX=...
   INVOICE_STREET=...
   INVOICE_CITY=...
   INVOICE_EMAIL=...
   INVOICE_VAT_ID=...
   INVOICE_BANK_DETAILS=...
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Features

- Drag & drop audio upload.
- Real-time status updates.
- Secure file handling.
