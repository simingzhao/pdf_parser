"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Cpu,
  Download,
  Eye,
  FileText,
  ListFilter,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getTaskById } from "@/lib/task-management"
import { Task } from "@/types/pdf-parser-types"
import { ResultsList } from "../_components/results-list"
import { EmptyState } from "../_components/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PDFViewer from "../_components/pdf-viewer"

export default function ResultsPage() {
  const params = useParams<{ taskId: string }>()
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPdf, setShowPdf] = useState(false)

  // Function to fetch task data
  const fetchTaskData = () => {
    try {
      const taskData = getTaskById(params.taskId)
      console.log("Fetched task:", taskData?.id, "Status:", taskData?.status)
      setTask(taskData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching task:", error)
      setLoading(false)
    }
  }

  // Fetch task on initial load
  useEffect(() => {
    fetchTaskData()
  }, [params.taskId])

  // Set up interval to periodically refresh task data while processing or extracting
  useEffect(() => {
    // Only set interval if task is in processing or extraction state
    if (
      task &&
      (task.status === "processing" || task.status === "extraction")
    ) {
      console.log("Setting up refresh interval for task status:", task.status)

      const interval = setInterval(() => {
        console.log("Refreshing task data...")
        fetchTaskData()
      }, 2000) // Check every 2 seconds

      // Clear interval when component unmounts or task is no longer processing/extracting
      return () => {
        console.log("Clearing refresh interval")
        clearInterval(interval)
      }
    }
  }, [task, params.taskId])

  // Function to handle CSV export
  const handleExportCSV = () => {
    if (!task || !task.results) return

    // Convert results to CSV
    const headers = ["Field", "Value"]
    const rows = task.results.map(result => {
      const field = task.fields.find(f => f.id === result.fieldId)
      return [field?.name || result.fieldId, result.value]
    })

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `${task.fileName.replace(".pdf", "")}_extracted_data.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Determine what title to show based on task status
  const getPageTitle = () => {
    if (!task) return "Results"

    switch (task.status) {
      case "completed":
        return "Extracted Results"
      case "failed":
        return "Extraction Failed"
      case "extraction":
        return "AI Extraction in Progress"
      case "processing":
      case "pending":
      default:
        return "Processing PDF"
    }
  }

  // Helper to check if we should show a loading state
  const isProcessing =
    task &&
    (task.status === "processing" ||
      task.status === "extraction" ||
      task.status === "pending")

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loader2 className="text-primary size-8 animate-spin" />
        <p className="text-muted-foreground mt-4">Loading results...</p>
      </div>
    )
  }

  if (!task) {
    return (
      <EmptyState
        icon={FileText}
        title="Task Not Found"
        description="The task you're looking for doesn't exist or has been deleted."
        action={<Button onClick={() => router.push("/")}>Back to Home</Button>}
      />
    )
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/")}
            className="gap-1"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {getPageTitle()}
          </h1>
        </div>

        {!isProcessing && task.status !== "failed" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPdf(!showPdf)}
            className="gap-1"
          >
            <Eye className="size-4" />
            {showPdf ? "Hide PDF" : "View PDF"}
          </Button>
        )}
      </div>

      <p className="text-muted-foreground text-lg">{task.fileName}</p>

      {showPdf && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle>Original PDF</CardTitle>
          </CardHeader>
          <CardContent className="h-[600px] p-0">
            {task.fileData && <PDFViewer pdfData={task.fileData} />}
          </CardContent>
        </Card>
      )}

      {isProcessing ? (
        <div className="bg-muted/20 flex flex-col items-center justify-center space-y-6 rounded-lg border py-12">
          {task.status === "extraction" ? (
            <>
              <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
                <Cpu className="text-primary size-8 animate-pulse" />
              </div>
              <div className="max-w-md space-y-2 text-center">
                <h3 className="text-xl font-semibold">
                  AI is extracting your data
                </h3>
                <p className="text-muted-foreground">
                  The PDF has been processed and our AI is now extracting the
                  data you requested. This may take a few moments depending on
                  the complexity of your document.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
                <Loader2 className="text-primary size-8 animate-spin" />
              </div>
              <div className="max-w-md space-y-2 text-center">
                <h3 className="text-xl font-semibold">Processing your PDF</h3>
                <p className="text-muted-foreground">
                  We're extracting the text content from your PDF. This may take
                  a moment depending on the size and complexity of your
                  document.
                </p>
              </div>
            </>
          )}
        </div>
      ) : task.status === "failed" ? (
        <div className="bg-destructive/10 flex flex-col items-center justify-center space-y-6 rounded-lg border py-12">
          <div className="bg-destructive/20 flex size-16 items-center justify-center rounded-full">
            <FileText className="text-destructive size-8" />
          </div>
          <div className="max-w-md space-y-2 text-center">
            <h3 className="text-xl font-semibold">Extraction Failed</h3>
            <p className="text-muted-foreground">
              We encountered an error while processing your PDF. Please try
              again with a different file or check if the PDF is valid.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/")}
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListFilter className="text-muted-foreground size-5" />
              <h2 className="text-xl font-semibold">
                {task.results?.length || 0} Fields Extracted
              </h2>
            </div>

            {task.results && task.results.length > 0 && (
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Download className="size-4" />
                Export CSV
              </Button>
            )}
          </div>

          {task.results && task.results.length > 0 ? (
            <ResultsList results={task.results} fields={task.fields} />
          ) : (
            <div className="bg-muted/20 flex flex-col items-center justify-center space-y-4 rounded-lg border py-12">
              <p className="text-muted-foreground">
                No data was extracted from this PDF.
              </p>
              <Button variant="outline" onClick={() => router.push("/")}>
                Try Again
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
