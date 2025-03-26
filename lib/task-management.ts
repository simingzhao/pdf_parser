"use client"

import {
  CreateTaskParams,
  ExtractionResult,
  Task
} from "@/types/pdf-parser-types"
import { v4 as uuidv4 } from "uuid"
import { extractDataWithLLM } from "./llm"
import { parsePDFClient } from "./client-parser"

const LOCAL_STORAGE_KEY = "pdf-parser-tasks"

// Helper to convert a File to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// Create a new task
export const createTask = async (params: CreateTaskParams): Promise<Task> => {
  // Convert file to base64
  const fileData = await fileToBase64(params.file)

  const task: Task = {
    id: uuidv4(),
    fileName: params.fileName,
    fileData,
    fields: params.fields,
    status: "pending",
    createdAt: new Date().toISOString()
  }

  // Save the task to localStorage
  const tasks = loadTasks()
  tasks.push(task)
  saveTasks(tasks)

  console.log("Task created:", task.id, "File name:", task.fileName)

  return task
}

// Load tasks from localStorage
export const loadTasks = (): Task[] => {
  if (typeof window === "undefined") return []

  const tasksJson = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (!tasksJson) return []

  try {
    return JSON.parse(tasksJson)
  } catch (error) {
    console.error("Error parsing tasks from localStorage:", error)
    return []
  }
}

// Save tasks to localStorage
export const saveTasks = (tasks: Task[]): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    console.error("Error saving tasks to localStorage:", error)
  }
}

// Get a task by ID
export const getTaskById = (taskId: string): Task | null => {
  const tasks = loadTasks()
  return tasks.find(task => task.id === taskId) || null
}

// Delete a task
export const deleteTask = (taskId: string): void => {
  const tasks = loadTasks()
  const updatedTasks = tasks.filter(task => task.id !== taskId)
  saveTasks(updatedTasks)
}

// Update a task's status
export const updateTaskStatus = (
  taskId: string,
  status: Task["status"],
  results?: ExtractionResult[]
): void => {
  const tasks = loadTasks()
  const updatedTasks = tasks.map(task => {
    if (task.id === taskId) {
      console.log(
        `Updating task ${taskId} status to ${status}${results ? " with results" : ""}`
      )
      if (results) {
        console.log(
          "Results:",
          JSON.stringify(results).substring(0, 100) + "..."
        )
      }

      return {
        ...task,
        status,
        results: results || task.results
      }
    }
    return task
  })

  saveTasks(updatedTasks)
}

// Process a PDF file
export const processPDF = async (taskId: string): Promise<void> => {
  try {
    console.log("Starting PDF processing for task:", taskId)

    const task = getTaskById(taskId)
    if (!task) {
      console.error("Task not found:", taskId)
      throw new Error("Task not found")
    }

    // Update status to processing (PDF parsing phase)
    updateTaskStatus(taskId, "processing")

    // Parse PDF to text using the client-side parser
    console.log("Parsing PDF to text...")
    const pdfText = await parsePDFClient(task.fileData)
    console.log("PDF parsed successfully, text length:", pdfText.length)

    if (!pdfText || pdfText.length === 0) {
      console.error("PDF parsing resulted in empty text")
      throw new Error("PDF parsing failed - empty text")
    }

    // Update status to extraction (AI extraction phase)
    updateTaskStatus(taskId, "extraction")

    // Use LLM to extract the data based on the fields
    console.log(
      "Extracting data with LLM for fields:",
      task.fields.map(f => f.name).join(", ")
    )
    const results = await extractDataWithLLM(pdfText, task.fields)
    console.log("Data extraction completed, results:", results.length)

    if (!results || results.length === 0) {
      console.error("Data extraction returned no results")
      throw new Error("Data extraction failed")
    }

    // Update the task with the results
    console.log("Updating task with results")
    updateTaskStatus(taskId, "completed", results)

    // Verify the task was updated properly
    const updatedTask = getTaskById(taskId)
    console.log(
      "Task updated, status:",
      updatedTask?.status,
      "has results:",
      !!updatedTask?.results
    )
  } catch (error) {
    console.error("Error processing PDF:", error)
    updateTaskStatus(taskId, "failed")
    throw error // Rethrow to allow error handling higher up
  }
}
