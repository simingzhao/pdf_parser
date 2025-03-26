"use client"

import { ExtractionField, ExtractionResult } from "@/types/pdf-parser-types"

/**
 * Client-side function to extract data from PDF text using the OpenAI API
 * Makes a request to our API route that handles the OpenAI API call
 */
export const extractDataWithLLM = async (
  pdfText: string,
  fields: ExtractionField[]
): Promise<ExtractionResult[]> => {
  console.log("LLM: Starting data extraction with OpenAI...")
  console.log(
    "LLM: Text length:",
    pdfText.length,
    "Number of fields:",
    fields.length
  )
  console.log("LLM: Fields to extract:", fields.map(f => f.name).join(", "))

  try {
    // Call our API endpoint that interfaces with OpenAI
    console.log("LLM: Calling extract-data API...")
    const response = await fetch("/api/extract-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pdfText, fields })
    })

    console.log("LLM: API response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("LLM: API error:", errorData)
      throw new Error(errorData.error || `API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(
      "LLM: Extraction successful, number of results:",
      data.results?.length || 0
    )

    // Log a sample of the results
    if (data.results && data.results.length > 0) {
      console.log("LLM: First result:", JSON.stringify(data.results[0]))
    }

    return data.results
  } catch (error) {
    console.error("LLM: Error extracting data:", error)
    console.log("LLM: Falling back to regex extraction")

    // Fallback to regex extraction if API fails
    return fallbackRegexExtraction(pdfText, fields)
  }
}

/**
 * Fallback extraction using regex patterns when the API is unavailable
 * This ensures the application can still function if the API is down or rate limited
 */
const fallbackRegexExtraction = (
  pdfText: string,
  fields: ExtractionField[]
): ExtractionResult[] => {
  console.log("LLM: Using fallback regex extraction...")

  const results: ExtractionResult[] = []

  // Enhanced extraction patterns with multiple variations for each field
  const patterns: Record<string, RegExp[]> = {
    name: [
      /(?:name|full name)[:\s]+([A-Za-z\s.'-]+)(?:\r|\n|,)/i,
      /^([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)$/m, // Capitalized full names at line start
      /resume(?:\s+of|\s+for)?[:\s]+([A-Za-z\s.'-]+)(?:\r|\n|,)/i
    ],
    email: [
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i,
      /email[:\s]+([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i,
      /contact[:\s]+(?:[^@\n]*?)?([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i
    ],
    phone: [
      /(?:phone|tel|telephone|mobile)[:\s]+([\+\d\s()\-\.]{10,20})/i,
      /(?:contact|call)[:\s]+([\+\d\s()\-\.]{10,20})/i,
      /((?:\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4})/i
    ],
    address: [
      /(?:address|location)[:\s]+([A-Za-z0-9\s.,#'-]+(?:[A-Za-z]{2}[\s,]+\d{5}(?:-\d{4})?))/i,
      /([A-Za-z0-9\s.,#'-]+(?:[A-Za-z]{2}[\s,]+\d{5}(?:-\d{4})?))/i,
      /([A-Za-z0-9\s.,#'-]+(?:Street|Avenue|Road|Blvd|Lane|Dr\.?|Drive)[A-Za-z0-9\s.,#'-]*)/i
    ],
    education: [
      /(?:education|university|college)[:\s]+([A-Za-z\s.,#\(\)'-]+)(?:\r|\n)/i,
      /(?:degree|diploma)[:\s]+([A-Za-z\s.,#\(\)'-]+)(?:\r|\n)/i,
      /(?:B\.?A\.?|B\.?S\.?|M\.?A\.?|M\.?S\.?|Ph\.?D\.?)[,\s]+([A-Za-z\s.,#\(\)'-]+)/i
    ],
    experience: [
      /(?:experience|work)[:\s]+([A-Za-z\s.,&\(\)#'-]+)(?:\r|\n)/i,
      /(?:company|employer)[:\s]+([A-Za-z\s.,&\(\)#'-]+)(?:\r|\n)/i,
      /(?:job title|position)[:\s]+([A-Za-z\s.,&\(\)#'-]+)(?:\r|\n)/i
    ],
    skills: [
      /(?:skills|expertise)[:\s]+([A-Za-z\s.,&\(\)#'-]+)(?:\r|\n)/i,
      /(?:technical skills|competencies)[:\s]+([A-Za-z\s.,&\(\)#'-]+)(?:\r|\n)/i,
      /(?:proficient in|familiar with)[:\s]+([A-Za-z\s.,&\(\)#'-]+)(?:\r|\n)/i
    ],
    invoice_number: [
      /(?:invoice|invoice no|invoice number|invoice #)[:\s#]+([A-Za-z0-9\s-]+)/i,
      /(?:invoice|invoice no|invoice number|invoice #)[:\s#]+([A-Za-z0-9\s-]+)/i,
      /(?:invoice|inv)[:\s#]+([A-Za-z0-9\s-]+)/i
    ],
    invoice_date: [
      /(?:date|invoice date)[:\s]+([A-Za-z0-9\s.,\/-]+)/i,
      /(?:issued|issued on|created on)[:\s]+([A-Za-z0-9\s.,\/-]+)/i,
      /(?:date)[:\s]+([0-3]?[0-9][\/-][0-3]?[0-9][\/-][0-9]{2,4})/i
    ],
    total_amount: [
      /(?:total|amount|total amount)[:\s$£€]+([0-9,.]+)/i,
      /(?:total|amount|total amount|sum)[:\s$£€]+([0-9,.]+)/i,
      /(?:total|amount|total amount)[:\s]*[$£€]?\s*([0-9,.]+)/i
    ],
    company_name: [
      /(?:company|business|from)[:\s]+([A-Za-z0-9\s.,&#'-]+)(?:\r|\n)/i,
      /(?:company|business|from)[:\s]+([A-Za-z0-9\s.,&#'-]+)(?:\r|\n)/i,
      /^([A-Z][A-Za-z0-9\s.,&#'-]+(?:Inc\.?|LLC|Ltd\.?|Corporation|Corp\.?|Co\.?))/m
    ]
  }

  // Attempt to extract based on the field name or description
  for (const field of fields) {
    console.log(`LLM: Attempting regex extraction for field "${field.name}"`)

    let value = "Data not found"
    let found = false

    // Try to match the field name to a pattern group
    const fieldLower = field.name.toLowerCase()
    const descriptionLower = field.description.toLowerCase()
    const keys = Object.keys(patterns)

    // Find a matching pattern
    const matchingKey = keys.find(
      key => fieldLower.includes(key) || descriptionLower.includes(key)
    )

    if (matchingKey && patterns[matchingKey]) {
      console.log(`LLM: Using pattern for "${matchingKey}"`)

      // Try each pattern in the group until one matches
      for (const pattern of patterns[matchingKey]) {
        const match = pdfText.match(pattern)
        if (match && match[1]) {
          value = match[1].trim()
          found = true
          console.log(
            `LLM: Found match for "${field.name}": "${value.substring(0, 50)}${value.length > 50 ? "..." : ""}"`
          )
          break
        }
      }

      if (!found) {
        console.log(
          `LLM: No match found for "${field.name}" using "${matchingKey}" patterns`
        )
      }
    } else {
      // If no pattern matches, look for the field name directly in the text
      console.log(
        `LLM: No specific pattern found for "${field.name}", using generic patterns`
      )

      // Try several generic patterns
      const genericPatterns = [
        new RegExp(
          `${field.name}[:\\s]+([A-Za-z0-9\\s.,#'\\/-]+)(?:\\r|\\n|,)`,
          "i"
        ),
        new RegExp(`${field.name}[:\\s]+([^\\r\\n]+)`, "i"),
        new RegExp(`${field.name.split(" ")[0]}[:\\s]+([^\\r\\n]+)`, "i") // Try with just first word
      ]

      for (const pattern of genericPatterns) {
        const match = pdfText.match(pattern)
        if (match && match[1]) {
          value = match[1].trim()
          found = true
          console.log(
            `LLM: Found match with generic pattern: "${value.substring(0, 50)}${value.length > 50 ? "..." : ""}"`
          )
          break
        }
      }

      if (!found) {
        console.log(
          `LLM: No match found with generic patterns for "${field.name}"`
        )
      }
    }

    results.push({
      fieldId: field.id,
      value
    })
  }

  console.log("LLM: Regex extraction completed, results:", results.length)
  return results
}
