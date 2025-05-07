"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react"
import * as XLSX from "xlsx"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface FileUploadFormProps {
  setExcelData: (data: any[]) => void
  onComplete?: () => void
}

export function FileUploadForm({ setExcelData, onComplete }: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
        setError("Please upload an Excel file (.xlsx or .xls)")
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an Excel file to upload")
      return
    }

    setIsLoading(true)
    setProgress(0)
    setError(null)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 200)

      const data = await readExcelFile(file)

      clearInterval(progressInterval)
      setProgress(100)

      if (data.length === 0) {
        throw new Error("The Excel file is empty or has no valid data")
      }

      setExcelData(data)
      toast({
        title: "File uploaded successfully",
        description: `Loaded ${data.length} rows of data`,
      })

      if (onComplete) {
        setTimeout(onComplete, 500)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to parse the Excel file")
      toast({
        title: "Error reading file",
        description: "Failed to parse the Excel file. Please check the format.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: "binary" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = (error) => reject(error)
      reader.readAsBinaryString(file)
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-10 transition-colors hover:border-muted-foreground/50">
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="mb-2 text-sm font-semibold">Drag and drop your Excel file here</p>
          <p className="mb-4 text-xs text-muted-foreground">or</p>
          <Input id="excel-file" type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
          <label htmlFor="excel-file">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>Browse files</span>
            </Button>
          </label>
          <p className="mt-2 text-xs text-muted-foreground">Supports .xlsx and .xls files</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {file && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 border rounded-md bg-muted/50">
              <FileSpreadsheet className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <Button onClick={handleUpload} disabled={isLoading} className="flex-shrink-0">
                {isLoading ? "Processing..." : "Upload"}
              </Button>
            </div>

            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {progress < 100 ? "Processing file..." : "Finalizing..."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
