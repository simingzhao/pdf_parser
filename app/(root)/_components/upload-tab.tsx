"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UploadCloud, File, Trash2 } from "lucide-react"
import { useCallback, useState } from "react"

interface UploadTabProps {
  file: File | null
  onFileChange: (file: File | null) => void
}

export default function UploadTab({ file, onFileChange }: UploadTabProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile && droppedFile.type === "application/pdf") {
        onFileChange(droppedFile)
      }
    },
    [onFileChange]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        onFileChange(e.target.files[0])
      }
    },
    [onFileChange]
  )

  const removeFile = useCallback(() => {
    onFileChange(null)
  }, [onFileChange])

  return (
    <div className="py-4">
      {file ? (
        <Card className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <File className="size-8 text-blue-500" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={removeFile}
            className="flex items-center gap-1"
          >
            <Trash2 className="size-4" />
            Remove
          </Button>
        </Card>
      ) : (
        <div
          className={`rounded-lg border-2 border-dashed p-12 text-center ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          } transition-colors duration-200`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <UploadCloud className="size-12 text-gray-400" />
            <div>
              <p className="mb-1 text-lg font-medium">
                Drag & drop your PDF file here
              </p>
              <p className="mb-4 text-gray-500">or click to browse files</p>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileInput}
                id="file-upload"
                className="hidden"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Upload PDF
                </label>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
