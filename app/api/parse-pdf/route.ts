/*
API route that handles PDF parsing with pdf2json
*/

import { NextRequest, NextResponse } from "next/server"
import { parsePDF } from "@/lib/pdf-parser"

export async function POST(req: NextRequest) {
  console.log("API: PDF parsing route called")

  try {
    const body = await req.json()
    const { pdfData } = body

    if (!pdfData) {
      console.error("API: PDF data is missing in request")
      return NextResponse.json(
        { error: "PDF data is required" },
        { status: 400 }
      )
    }

    console.log("API: Received PDF data, length:", pdfData.length)

    // Call the parsePDF function with error handling
    let text
    try {
      console.log("API: Calling server-side parsePDF function")
      text = await parsePDF(pdfData)
      console.log("API: PDF successfully parsed, text length:", text.length)

      // Log the first 200 chars of the parsed text for debugging
      if (text && text.length > 0) {
        console.log(
          "API: First 200 chars of parsed text:",
          text.substring(0, 200)
        )
      } else {
        console.error("API: Parsed text is empty")
      }
    } catch (error) {
      console.error("API: Error parsing PDF:", error)
      return NextResponse.json(
        { error: "Failed to parse PDF content" },
        { status: 500 }
      )
    }

    // Return the extracted text
    console.log("API: Returning parsed text to client")
    return NextResponse.json({ text }, { status: 200 })
  } catch (error) {
    console.error("API: Error in parse-pdf API route:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
