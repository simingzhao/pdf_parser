"use client"

import { ExtractionField, ExtractionResult } from "@/types/pdf-parser-types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Clipboard, ClipboardCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ResultsListProps {
  results: ExtractionResult[]
  fields: ExtractionField[]
}

// Helper function to normalize and clean up text that has abnormal spacing
const normalizeText = (text: string): string => {
  // Check if text has abnormal spacing (spaces between most characters)
  if (text.split("").filter(c => c === " ").length > text.length / 3) {
    // Remove all spaces and add them back at appropriate positions
    return text
      .replace(/\s+/g, "")
      .replace(/([.,;!?])/g, "$1 ")
      .trim()
  }
  return text
}

export function ResultsList({ results, fields }: ResultsListProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopyToClipboard = (value: string, fieldId: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(fieldId)

    // Reset the icon after 2 seconds
    setTimeout(() => {
      setCopiedField(null)
    }, 2000)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Field</TableHead>
            <TableHead>Extracted Value</TableHead>
            <TableHead className="w-[80px]">Copy</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map(result => {
            // Find the field that matches this result
            const field = fields.find(f => f.id === result.fieldId)
            if (!field) return null

            // Normalize the value to fix spacing issues
            const normalizedValue = normalizeText(result.value)

            return (
              <TableRow key={result.fieldId}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{field.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {field.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {normalizedValue === "Not found" ? (
                    <span className="text-muted-foreground italic">
                      Not found
                    </span>
                  ) : (
                    <span className="whitespace-pre-wrap break-words">
                      {normalizedValue}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleCopyToClipboard(normalizedValue, result.fieldId)
                    }
                    disabled={normalizedValue === "Not found"}
                  >
                    {copiedField === result.fieldId ? (
                      <ClipboardCheck className="size-4 text-green-500" />
                    ) : (
                      <Clipboard className="size-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
