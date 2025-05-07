import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to replace template variables with actual data
export function processTemplate(template: string, data: Record<string, any>): string {
  if (!template) return ""

  let processedTemplate = template

  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{${key}}`, "g")
    processedTemplate = processedTemplate.replace(regex, String(value || ""))
  }

  return processedTemplate
}
