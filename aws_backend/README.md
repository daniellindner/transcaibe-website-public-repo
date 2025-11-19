# AWS Backend

This directory contains the AWS CDK code for the Speech to Text backend.

## Prerequisites

- AWS CLI configured.
- Node.js & NPM.
- Python 3.11 (for Lambda functions).

## Setup & Deployment

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Environment Variables**:
   You must define the following environment variables before deployment (or in your CI/CD pipeline):
   - `VERCEL_DEPLOYMENT_URL`: The URL of your frontend (e.g., `https://your-app.vercel.app`).
   - `AWS_API_KEY`: A shared secret string for API security.

   See `.env.example` for reference.

3. **OpenAI Key**:
   Create a file `lib/openAI-secret-key.ts` with your OpenAI API key:

   ```typescript
   export const OPENAI_SECRET_KEY = "sk-...";
   ```

   _Note: This file is git-ignored to prevent accidental commits._

4. **Deploy**:
   ```bash
   npx cdk deploy
   ```

## Architecture

The stack (`VoiceToTextAwsBackendStack`) provisions:

- **S3 Bucket**: For user uploads (auto-deletes after 48h).
- **SQS Queue**: Triggers transcription jobs.
- **Lambda Functions**:
  - `transcribeLambda`: Runs OpenAI Whisper (Python).
  - FFmpeg layer for audio processing.
