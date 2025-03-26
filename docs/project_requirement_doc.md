I want to build a PDF Parsing mvp webapp, here is my PRD:

## Project Description
A web application that allows users to upload PDF files, specify fields for extraction, and receive structured data output in JSON format with CSV export capability. The system focuses on parsing resumes and invoices for recruiters and businesses.

## Target Audience
- Recruiters parsing resume information
- Businesses handling invoices
- Anyone needing to extract structured data from PDFs

## Desired Features
### Dashboard
-  Display list of initiated tasks
-  Show status of tasks (running, done)

### Task Creation
-  Pop-up input form
-  File upload/drag area for PDF files
-  Area to specify extraction fields
-  Delete and re-upload file capability
-  Start button to initiate extraction
-  Save extraction field templates for future use

### Backend Processing
-  Parse PDF file into LLM-friendly content
-  Design LLM workflow for information extraction
-  Generate results in JSON format

### Results Viewing
-  View results in pop-up panel
-  View original PDF alongside extraction results
-  Export results as CSV file

## Design Requests
-  Modern and sleek minimalist style
-  Color scheme

## Other Notes
- No database implementation required for MVP
- No user authentication/authorization required for MVP
- System should handle normal PDF documents like resumes and invoices