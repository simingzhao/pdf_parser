"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import UploadTab from "./upload-tab"
import FieldsTab from "./fields-tab"
import { ExtractionField, Task } from "@/types/pdf-parser-types"
import { createTask, processPDF } from "@/lib/task-management"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

interface TaskCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskCreated: () => void
}

export default function TaskCreationModal({
  isOpen,
  onClose,
  onTaskCreated
}: TaskCreationModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fields, setFields] = useState<ExtractionField[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile)
    if (newFile) {
      setActiveTab("fields")
    }
  }

  const handleFieldsChange = (newFields: ExtractionField[]) => {
    setFields(newFields)
  }

  const handleStartProcessing = async () => {
    if (!file || fields.length === 0) {
      toast({
        title: "Missing information",
        description:
          "Please upload a file and specify at least one extraction field.",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)

    try {
      console.log("Creating task with file:", file.name)
      // Create the task
      const task = await createTask({
        fileName: file.name,
        file,
        fields
      })

      console.log("Task created:", task.id)
      toast({
        title: "Task created",
        description: "Starting PDF processing..."
      })

      // Process the PDF in the background
      processPDF(task.id)
        .then(() => {
          console.log("PDF processed successfully")
          toast({
            title: "Success",
            description: "Your PDF has been processed successfully."
          })
          onTaskCreated()
        })
        .catch(error => {
          console.error("Error processing PDF:", error)
          toast({
            title: "Processing error",
            description:
              "There was an error processing your PDF. Please try again.",
            variant: "destructive"
          })
        })

      // Close the modal
      onClose()
      onTaskCreated()
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "There was an error creating your task. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create a New Extraction Task</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload PDF</TabsTrigger>
            <TabsTrigger value="fields" disabled={!file}>
              Specify Fields
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <UploadTab file={file} onFileChange={handleFileChange} />
          </TabsContent>
          <TabsContent value="fields">
            <FieldsTab fields={fields} onFieldsChange={handleFieldsChange} />
          </TabsContent>
        </Tabs>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleStartProcessing}
            disabled={!file || fields.length === 0 || isProcessing}
            className="flex items-center gap-2"
          >
            <Play className="size-4" />
            {isProcessing ? "Processing..." : "Start Extraction"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
