# PDF Parser Application

A web application that allows users to upload PDF files, specify fields for extraction, and receive structured data output in JSON format with CSV export capability.

## Features

- Upload PDF files
- Specify extraction fields
- Extract data using AI (OpenAI)
- View results alongside original PDF
- Export results as CSV
- Save extraction templates for future use

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Create a `.env.local` file with your OpenAI API key:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` to add your OpenAI API key.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Click "New Task" to begin
2. Upload a PDF file
3. Specify the fields you want to extract
4. Click "Start Extraction"
5. View the results

## Technology Stack

- Frontend: Next.js, Tailwind CSS, Shadcn UI
- PDF Parsing: pdf2json
- AI: OpenAI API
- Data: Client-side storage (localStorage)
