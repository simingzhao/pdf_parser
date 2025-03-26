"use client"

/**
 * Client-side wrapper for PDF parsing functionality
 */

// Function to parse PDF through the API
export async function parsePDFClient(pdfData: string): Promise<string> {
  console.log("Client: Starting PDF parsing process...")

  try {
    console.log("Client: Sending PDF data to API, data length:", pdfData.length)

    const response = await fetch("/api/parse-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ pdfData })
    })

    console.log("Client: API response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Client: API error:", errorData)
      throw new Error(
        errorData.error || `Error ${response.status}: ${response.statusText}`
      )
    }

    const data = await response.json()
    console.log(
      "Client: PDF parsed successfully, text length:",
      data.text.length
    )

    return data.text
  } catch (error) {
    console.error("Client: Error parsing PDF:", error)
    throw error
  }
}
