"use client"

import { ExtractionField } from "@/types/pdf-parser-types"

const LOCAL_STORAGE_KEY = "pdf-parser-templates"

interface Template {
  name: string
  fields: ExtractionField[]
}

// Save a template
export const saveTemplate = (name: string, fields: ExtractionField[]): void => {
  if (typeof window === "undefined") return

  try {
    const templates = loadTemplates()

    // Check if template with this name already exists
    const existingIndex = templates.findIndex(t => t.name === name)

    if (existingIndex !== -1) {
      // Update existing template
      templates[existingIndex].fields = [...fields]
    } else {
      // Add new template
      templates.push({ name, fields: [...fields] })
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates))
  } catch (error) {
    console.error("Error saving template:", error)
  }
}

// Load all templates
export const loadTemplates = (): Template[] => {
  if (typeof window === "undefined") return []

  const templatesJson = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (!templatesJson) return []

  try {
    return JSON.parse(templatesJson)
  } catch (error) {
    console.error("Error parsing templates from localStorage:", error)
    return []
  }
}

// Get a template by name
export const getTemplateByName = (name: string): Template | null => {
  const templates = loadTemplates()
  return templates.find(template => template.name === name) || null
}

// Delete a template
export const deleteTemplate = (name: string): void => {
  if (typeof window === "undefined") return

  try {
    const templates = loadTemplates()
    const updatedTemplates = templates.filter(
      template => template.name !== name
    )
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTemplates))
  } catch (error) {
    console.error("Error deleting template:", error)
  }
}
