"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { processTemplate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface PreviewStepProps {
  data: any[]
  columnMapping: {
    email: string
    name?: string
    [key: string]: string | undefined
  }
  setColumnMapping: React.Dispatch<
    React.SetStateAction<{
      email: string
      name?: string
      [key: string]: string | undefined
    }>
  >
  template: string
  subject: string
  onComplete: (preparedEmails: Array<{ to: string; subject: string; message: string }>) => void
  onBack: () => void
}

export function PreviewStep({
  data,
  columnMapping,
  setColumnMapping,
  template,
  subject,
  onComplete,
  onBack,
}: PreviewStepProps) {
  const [previewIndex, setPreviewIndex] = useState(0)
  const { toast } = useToast()
  const columns = data.length > 0 ? Object.keys(data[0]) : []

  useEffect(() => {
    // Try to auto-detect email column if not set
    if (!columnMapping.email && columns.length > 0) {
      const emailColumn = columns.find(
        (col) =>
          col.toLowerCase().includes("email") ||
          col.toLowerCase().includes("mail") ||
          col.toLowerCase().includes("e-mail"),
      )

      if (emailColumn) {
        setColumnMapping((prev) => ({ ...prev, email: emailColumn }))
      }
    }

    // Try to auto-detect name column if not set
    if (!columnMapping.name && columns.length > 0) {
      const nameColumn = columns.find(
        (col) =>
          col.toLowerCase().includes("name") ||
          col.toLowerCase().includes("customer") ||
          col.toLowerCase().includes("client"),
      )

      if (nameColumn) {
        setColumnMapping((prev) => ({ ...prev, name: nameColumn }))
      }
    }
  }, [columns, columnMapping.email, columnMapping.name, setColumnMapping])

  const handleContinue = () => {
    if (!columnMapping.email) {
      toast({
        title: "Email column required",
        description: "Please select which column contains email addresses",
        variant: "destructive",
      })
      return
    }

    // Validate email addresses
    const invalidEmails = data.filter((row) => {
      const email = row[columnMapping.email]
      return !email || !isValidEmail(email)
    })

    if (invalidEmails.length > 0) {
      toast({
        title: "Invalid email addresses",
        description: `${invalidEmails.length} records have invalid or missing email addresses`,
        variant: "destructive",
      })
      return
    }

    // Prepare emails for sending
    const preparedEmails = data.map((row) => ({
      to: row[columnMapping.email],
      subject: processTemplate(subject, row),
      message: processTemplate(template, row),
    }))

    onComplete(preparedEmails)
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const nextPreview = () => {
    setPreviewIndex((prev) => (prev + 1) % data.length)
  }

  const prevPreview = () => {
    setPreviewIndex((prev) => (prev - 1 + data.length) % data.length)
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Map Columns & Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-column">Email Column (Required)</Label>
                <Select
                  value={columnMapping.email}
                  onValueChange={(value) => setColumnMapping({ ...columnMapping, email: value })}
                >
                  <SelectTrigger id="email-column">
                    <SelectValue placeholder="Select email column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name-column">Name Column (Optional)</Label>
                <Select
                  value={columnMapping.name || ""}
                  onValueChange={(value) => setColumnMapping({ ...columnMapping, name: value })}
                >
                  <SelectTrigger id="name-column">
                    <SelectValue placeholder="Select name column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {columns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Alert className="mt-4">
                <AlertDescription>
                  Make sure to select the column that contains email addresses. This is required to send your campaign.
                </AlertDescription>
              </Alert>
            </div>

            {data.length > 0 && (
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted/30 p-3 border-b flex justify-between items-center">
                  <div className="text-sm font-medium">Email Preview</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={prevPreview}>
                      Previous
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {previewIndex + 1} of {data.length}
                    </span>
                    <Button variant="outline" size="sm" onClick={nextPreview}>
                      Next
                    </Button>
                  </div>
                </div>
                <div className="p-4 border-b">
                  <div className="text-xs text-muted-foreground mb-1">To:</div>
                  <div className="font-medium">
                    {columnMapping.email ? data[previewIndex][columnMapping.email] : "No email column selected"}
                  </div>
                </div>
                <div className="p-4 border-b">
                  <div className="text-xs text-muted-foreground mb-1">Subject:</div>
                  <div className="font-medium">{processTemplate(subject, data[previewIndex])}</div>
                </div>
                <div className="p-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {processTemplate(template, data[previewIndex])
                      .split("\n")
                      .map((line, i) => (
                        <p key={i}>{line || <br />}</p>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="bg-muted/30 p-3 border-b">
              <div className="text-sm font-medium">Data Preview</div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column} className="whitespace-nowrap">
                        {column}
                        {column === columnMapping.email && <span className="ml-1 text-primary text-xs">(Email)</span>}
                        {column === columnMapping.name && <span className="ml-1 text-primary text-xs">(Name)</span>}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 5).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((column) => (
                        <TableCell key={`${rowIndex}-${column}`} className="max-w-[200px] truncate">
                          {String(row[column] || "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {data.length > 5 && (
              <div className="p-2 text-center text-xs text-muted-foreground border-t">
                Showing 5 of {data.length} rows
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleContinue} className="gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </>
  )
}
