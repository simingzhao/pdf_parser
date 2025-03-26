"use client"

import { ExtractionField, ExtractionResult } from "@/types/pdf-parser-types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface ResultsPanelProps {
  results: ExtractionResult[]
  fields: ExtractionField[]
}

export default function ResultsPanel({ results, fields }: ResultsPanelProps) {
  const { toast } = useToast()
  const { isCopied, copyToClipboard } = useCopyToClipboard({})

  const handleCopyJSON = () => {
    const jsonString = JSON.stringify(results, null, 2)
    copyToClipboard(jsonString)
    toast({
      title: "Copied to clipboard",
      description: "JSON data has been copied to your clipboard."
    })
  }

  if (!results || results.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No results to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleCopyJSON}
        >
          {isCopied ? (
            <Check className="size-4" />
          ) : (
            <Copy className="size-4" />
          )}
          Copy JSON
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Field</TableHead>
            <TableHead>Extracted Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map(result => {
            // Find the corresponding field
            const field = fields.find(f => f.id === result.fieldId)
            return (
              <TableRow key={result.fieldId}>
                <TableCell className="font-medium">
                  {field ? field.name : "Unknown Field"}
                </TableCell>
                <TableCell>{result.value}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <Accordion type="single" collapsible className="mt-6">
        <AccordionItem value="json">
          <AccordionTrigger>View Raw JSON</AccordionTrigger>
          <AccordionContent>
            <Card className="max-h-[400px] overflow-auto bg-gray-50 p-4">
              <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
