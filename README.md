# Speech to Text Service

A scalable, serverless speech-to-text application built with Next.js and AWS CDK. It uses OpenAI's Whisper model for high-quality transcription.

## 🏗 Architecture

- **Frontend**: Next.js application (hosted on Vercel or locally).
- **Backend**: AWS Serverless architecture using CDK.
  - **API**: AWS Lambda & API Gateway (via S3 pre-signed URLs).
  - **Storage**: Amazon S3 (for audio files and transcriptions).
  - **Queue**: Amazon SQS (for processing jobs).
  - **Compute**: AWS Lambda (running OpenAI Whisper with FFmpeg).
  - **Database**: (Implicitly handled via S3/naming conventions or external DB if configured).

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.11+)
- AWS CLI configured with appropriate permissions.
- OpenAI API Key.

### 1. Backend Setup (`aws_backend`)

Navigate to the backend directory:

```bash
cd aws_backend
```

Install dependencies:

```bash
npm install
```

**Configuration:**

1. Copy `aws_backend/.env.example` to a new file (e.g., `.env` or set in your shell).
   ```bash
   export VERCEL_DEPLOYMENT_URL="http://localhost:3000"
   export AWS_API_KEY="your-secret-key"
   ```
2. Create `aws_backend/lib/openAI-secret-key.ts` from the example:
   ```bash
   cp aws_backend/lib/openAI-secret-key.ts.example aws_backend/lib/openAI-secret-key.ts
   ```
   Edit the file and insert your OpenAI API Key.

Deploy the stack:

```bash
npx cdk deploy
```

### 2. Frontend Setup (`website`)

Navigate to the website directory:

```bash
cd website
```

Install dependencies:

```bash
npm install
```

**Configuration:**
Create a `.env.local` file with the following variables (see `website/.env.example` if available, or derive from backend outputs):

```bash
NEXT_PUBLIC_AWS_API_URL=...
AWS_UPLOAD_BUCKET=...
AWS_API_KEY=your-secret-key (must match backend)
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🔒 Security Note

This project uses an `AWS_API_KEY` for simple authentication between the frontend and backend. Ensure this key is kept secret and rotated if exposed.
