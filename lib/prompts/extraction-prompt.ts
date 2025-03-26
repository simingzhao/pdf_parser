/**
 * Specialized extraction prompt for OpenAI to extract structured data from PDF documents.
 * This prompt is designed to guide the model to extract specific fields accurately.
 */

export function createSystemPrompt() {
  return `You are a specialized data extraction AI designed to find and extract specific data points from documents.

Your task is to extract EXACT text from the document for each requested field.

IMPORTANT INSTRUCTIONS:
1. Extract ONLY what is explicitly present in the document text.
2. Do NOT generate or infer information that isn't directly in the text.
3. For each field, search thoroughly through the entire document.
4. If the exact information cannot be found, respond with "Not found".
5. Return the text AS IT APPEARS in the document without summarizing or paraphrasing.
6. Do not add any explanations or reasoning - only return the extracted data.
7. Extracted values should be complete but concise - include the full relevant information but don't include surrounding irrelevant text.
8. For resume documents: pay special attention to sections like "Contact Information", "Skills", "Experience", "Education".
9. For invoice documents: focus on "Invoice Number", "Date", "Due Date", "Amount", "Client", "Items", etc.
10. For dates, maintain the original format as presented in the document.
11. For multi-part fields like addresses, include the complete value on a single line.`
}

export function createUserPrompt(
  fieldDescriptions: string,
  documentText: string
) {
  return `I need to extract the following fields from this document:

${fieldDescriptions}

Document text:
${documentText}`
}

export function createFieldDescription(
  fieldName: string,
  fieldDescription: string
) {
  return `- Field: "${fieldName}"
  Description: ${fieldDescription}
  Expected format: Return the exact text from the document that matches this field. If the field is not found, return "Not found".`
}
