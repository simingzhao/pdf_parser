"use client"

import { ExtractionResult } from "@/types/pdf-parser-types"

export const exportToCSV = (
  results: ExtractionResult[],
  filename: string
): void => {
  // Convert results to CSV
  const header = "Field ID,Value\n"
  const csvContent = results.reduce((acc, result) => {
    return acc + `${result.fieldId},${escapeCSV(result.value)}\n`
  }, header)

  // Create blob and download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  // Create a temporary link and trigger download
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.display = "none"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 100)
}

// Helper to escape CSV values
const escapeCSV = (value: string): string => {
  // If the value contains commas, quotes, or newlines, wrap it in quotes
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    // Double up any quotes in the value
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
