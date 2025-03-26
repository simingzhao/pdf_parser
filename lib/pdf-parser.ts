"use server"

// PDF parser implementation using pdf2json for PDF text extraction
import fs from "fs"
import path from "path"
import os from "os"
import { writeFile } from "fs/promises"

// Use CommonJS require since pdf2json doesn't export PDFParser correctly with ESM
const PdfParser = require("pdf2json")

// Server-side PDF parsing function
export async function parsePDF(pdfData: string): Promise<string> {
  console.log("Server: Starting PDF parsing...")

  try {
    // Remove data:application/pdf;base64, prefix if it exists
    const base64Data = pdfData.startsWith("data:application/pdf;base64,")
      ? pdfData.split(",")[1]
      : pdfData

    console.log("Server: Preparing base64 data, length:", base64Data.length)

    // Create a temporary file to store the PDF
    const tempDir = path.join(os.tmpdir(), "pdf-parser")
    const tempFilePath = path.join(tempDir, `temp-${Date.now()}.pdf`)

    // Ensure the temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
      console.log("Server: Created temp directory:", tempDir)
    }

    // Write the base64 data to a temporary file
    const pdfBuffer = Buffer.from(base64Data, "base64")
    console.log("Server: Created PDF buffer, size:", pdfBuffer.length)

    await writeFile(tempFilePath, pdfBuffer)
    console.log("Server: Wrote PDF to temp file:", tempFilePath)

    // Parse the PDF using pdf2json
    console.log("Server: Starting PDF parsing with pdf2json...")
    const pdfText = await parsePdfFile(tempFilePath)
    console.log("Server: PDF parsed successfully, text length:", pdfText.length)

    // Log sample of the text
    if (pdfText && pdfText.length > 0) {
      console.log(
        "Server: First 200 chars of extracted text:",
        pdfText.substring(0, 200)
      )
    } else {
      console.error("Server: Extracted text is empty")
    }

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath)
    console.log("Server: Deleted temporary file")

    return pdfText
  } catch (error) {
    console.error("Server: Error parsing PDF:", error)
    throw new Error(
      `Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

// Function to parse a PDF file and extract text
function parsePdfFile(filePath: string): Promise<string> {
  console.log("Server: Parsing PDF file:", filePath)

  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PdfParser()

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("Server: PDF parsing error:", errData)
        reject(new Error(errData.parserError || "Unknown PDF parsing error"))
      })

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          console.log("Server: PDF data ready event received")

          // Try to extract raw text content
          const rawTextContent = pdfParser.getRawTextContent()
          console.log(
            "Server: Raw text content extracted, length:",
            rawTextContent.length
          )

          // If raw text content is empty, try to extract text from the PDF data directly
          let extractedText = rawTextContent
          if (!extractedText || extractedText.length === 0) {
            console.log(
              "Server: Raw text content is empty, trying direct extraction from PDF data..."
            )
            extractedText = extractTextFromPdfData(pdfData)
            console.log(
              "Server: Direct extraction result, length:",
              extractedText.length
            )
          }

          // Clean up the text (pdf2json adds some special characters)
          const cleanedText = extractedText
            .replace(/\\/g, "")
            .replace(/\(cid:[0-9]+\)/g, "")
            .replace(/\s+/g, " ")
            .trim()

          console.log("Server: Text cleaned, final length:", cleanedText.length)

          // If text is still empty after all extraction attempts, create a debug file
          if (!cleanedText || cleanedText.length === 0) {
            console.error(
              "Server: Text is still empty after all extraction attempts"
            )
            // Write the PDF data to a JSON file for debugging
            const debugPath = path.join(
              os.tmpdir(),
              "pdf-parser",
              `debug-${Date.now()}.json`
            )
            fs.writeFileSync(debugPath, JSON.stringify(pdfData, null, 2))
            console.log("Server: Wrote debug data to:", debugPath)
          }

          resolve(cleanedText || "No text could be extracted from this PDF.")
        } catch (error) {
          console.error("Server: Error in pdfParser_dataReady handler:", error)
          reject(error)
        }
      })

      console.log("Server: Loading PDF file...")
      pdfParser.loadPDF(filePath)
    } catch (error) {
      console.error("Server: Error creating PDF parser:", error)
      reject(error)
    }
  })
}

// Function to extract text directly from the PDF data structure
function extractTextFromPdfData(pdfData: any): string {
  let text = ""

  try {
    console.log("Server: Starting direct extraction from PDF data")
    console.log("Server: Number of pages:", pdfData.Pages?.length || 0)

    // Loop through each page
    if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
      pdfData.Pages.forEach((page: any, pageIndex: number) => {
        console.log(`Server: Processing page ${pageIndex + 1}`)

        // Extract texts from the page
        if (page.Texts && Array.isArray(page.Texts)) {
          console.log(
            `Server: Page ${pageIndex + 1} has ${page.Texts.length} text elements`
          )

          page.Texts.forEach((textElement: any) => {
            // Process the text element
            if (textElement.R && Array.isArray(textElement.R)) {
              textElement.R.forEach((r: any) => {
                if (r.T) {
                  // Decode URI component (pdf2json encodes text as URI components)
                  try {
                    const decodedText = decodeURIComponent(r.T)
                    text += decodedText + " "
                  } catch (e) {
                    // If decoding fails, just add the raw text
                    text += r.T + " "
                  }
                }
              })
            }
          })

          // Add page break
          text += "\n\n"
        }
      })
    }

    console.log("Server: Direct extraction completed, length:", text.length)

    return text.trim()
  } catch (error) {
    console.error("Server: Error during direct PDF data extraction:", error)
    return ""
  }
}
