"use client"

import { useEffect, useRef } from "react"

interface PDFViewerProps {
  pdfData: string // Base64 encoded PDF data
}

export default function PDFViewer({ pdfData }: PDFViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      // Remove the data:application/pdf;base64, prefix if it exists
      const base64Data = pdfData.startsWith("data:application/pdf;base64,")
        ? pdfData.split(",")[1]
        : pdfData

      const blob = new Blob([base64ToArrayBuffer(base64Data)], {
        type: "application/pdf"
      })
      const url = URL.createObjectURL(blob)

      iframeRef.current.src = url

      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [pdfData])

  return (
    <iframe ref={iframeRef} className="size-full" title="PDF Viewer"></iframe>
  )
}

// Helper function to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string) {
  const binaryString = window.atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}
