/*
API route that handles PDF data extraction using OpenAI
*/

import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { ExtractionField, ExtractionResult } from "@/types/pdf-parser-types"
import {
  createSystemPrompt,
  createUserPrompt,
  createFieldDescription
} from "@/lib/prompts/extraction-prompt"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  console.log("Extract API: Route called")

  try {
    const body = await req.json()
    const { pdfText, fields } = body

    if (!pdfText || !fields || !Array.isArray(fields)) {
      console.error("Extract API: Missing required parameters")
      return NextResponse.json(
        { error: "PDF text and fields array are required" },
        { status: 400 }
      )
    }

    console.log("Extract API: Received text length:", pdfText.length)
    console.log("Extract API: Number of fields:", fields.length)
    console.log(
      "Extract API: Fields to extract:",
      fields.map((f: ExtractionField) => f.name).join(", ")
    )

    // Extract data using OpenAI
    console.log("Extract API: Calling extractDataWithOpenAI function")
    const results = await extractDataWithOpenAI(pdfText, fields)
    console.log(
      "Extract API: Extraction completed, results count:",
      results.length
    )

    return NextResponse.json({ results }, { status: 200 })
  } catch (error) {
    console.error("Extract API: Error in extract-data API route:", error)
    return NextResponse.json(
      { error: "Failed to extract data" },
      { status: 500 }
    )
  }
}

async function extractDataWithOpenAI(
  pdfText: string,
  fields: ExtractionField[]
): Promise<ExtractionResult[]> {
  console.log("Extract API: Preparing OpenAI request")

  // Create schema for OpenAI structured output
  const schemaProperties: Record<string, any> = {}

  // Add each field to the schema properties
  for (const field of fields) {
    schemaProperties[field.id] = {
      type: "string",
      description: `Extracted value for field: ${field.name} - ${field.description}`
    }
  }

  // Handle case where PDF text is too long by truncating
  // OpenAI has token limits, so we might need to limit the text size
  const maxTextLength = 15000 // Approximate to avoid exceeding token limits
  const truncatedText =
    pdfText.length > maxTextLength
      ? pdfText.substring(0, maxTextLength) +
        "... [text truncated due to length]"
      : pdfText

  console.log(
    "Extract API: Text prepared, original length:",
    pdfText.length,
    "truncated length:",
    truncatedText.length
  )
  console.log(
    "Extract API: First 200 chars of text:",
    truncatedText.substring(0, 200)
  )

  try {
    // Create detailed field descriptions for the prompt
    const fieldDescriptions = fields
      .map(field => createFieldDescription(field.name, field.description))
      .join("\n\n")

    console.log("Extract API: Checking OpenAI API key")
    const apiKeyStatus = process.env.OPENAI_API_KEY
      ? process.env.OPENAI_API_KEY.startsWith("sk-")
        ? "Valid format"
        : "Invalid format"
      : "Missing"
    console.log("Extract API: OpenAI API key status:", apiKeyStatus)

    console.log("Extract API: Calling OpenAI API")

    // Make the OpenAI API call with structured output
    const response = await openai.responses.create({
      model: "gpt-4o-2024-11-20",
      input: [
        {
          role: "system",
          content: createSystemPrompt()
        },
        {
          role: "user",
          content: createUserPrompt(fieldDescriptions, truncatedText)
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "extracted_data",
          schema: {
            type: "object",
            properties: schemaProperties,
            required: fields.map(field => field.id),
            additionalProperties: false
          },
          strict: true
        }
      },
      temperature: 0.1 // Lower temperature for more deterministic outputs
    })

    console.log("Extract API: OpenAI API response received")

    // Parse the results into the expected format
    const extractedData = JSON.parse(response.output_text)
    console.log(
      "Extract API: Parsed JSON data:",
      JSON.stringify(extractedData).substring(0, 100) + "..."
    )

    // Format results according to the expected structure
    const results: ExtractionResult[] = fields.map(field => ({
      fieldId: field.id,
      value: extractedData[field.id] || "Not found"
    }))

    console.log("Extract API: Formatted results for", results.length, "fields")

    return results
  } catch (error) {
    console.error("Extract API: OpenAI extraction error:", error)

    // Fallback to provide some results even if the API call fails
    console.log("Extract API: Using fallback extraction due to error")
    return fields.map(field => ({
      fieldId: field.id,
      value: "Error extracting data"
    }))
  }
}
