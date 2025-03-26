/*
Contains the types for the PDF parser functionality.
*/

export interface ExtractionField {
  id: string
  name: string
  description: string
}

export interface ExtractionResult {
  fieldId: string
  value: string
}

export type TaskStatus =
  | "pending"
  | "processing"
  | "extraction"
  | "completed"
  | "failed"

export interface Task {
  id: string
  fileName: string
  fileData: string // base64 encoded PDF data
  fields: ExtractionField[]
  status: TaskStatus
  results?: ExtractionResult[]
  createdAt: string
}

export interface CreateTaskParams {
  fileName: string
  file: File
  fields: ExtractionField[]
}
