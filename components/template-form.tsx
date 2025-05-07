"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Tag, Save, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { processTemplate } from "@/lib/utils"

interface TemplateFormProps {
  template: string
  setTemplate: (template: string) => void
  subject: string
  setSubject: (subject: string) => void
  columns: string[]
  onComplete?: () => void
}

export function TemplateForm({ template, setTemplate, subject, setSubject, columns, onComplete }: TemplateFormProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("edit")
  const [previewData, setPreviewData] = useState<Record<string, string>>({})

  const insertVariable = (column: string) => {
    const variable = `{${column}}`
    setTemplate(template + variable)
  }

  const handleSubjectVariableInsert = (column: string) => {
    const variable = `{${column}}`
    setSubject(subject + variable)
  }

  const saveTemplate = () => {
    if (!template) {
      toast({
        title: "Empty template",
        description: "Please create a template first",
        variant: "destructive",
      })
      return
    }

    if (!subject) {
      toast({
        title: "Missing subject",
        description: "Please add an email subject",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Template saved",
      description: "Your email template has been saved",
    })

    if (onComplete) {
      onComplete()
    }
  }

  const generateSampleData = () => {
    if (columns.length === 0) return {}

    const sampleData: Record<string, string> = {}
    columns.forEach((column) => {
      // Generate sample data based on column name
      if (column.toLowerCase().includes("name")) {
        sampleData[column] = "John Doe"
      } else if (column.toLowerCase().includes("email")) {
        sampleData[column] = "john.doe@example.com"
      } else if (column.toLowerCase().includes("date")) {
        sampleData[column] = "2023-05-15"
      } else if (column.toLowerCase().includes("amount") || column.toLowerCase().includes("price")) {
        sampleData[column] = "$99.99"
      } else if (column.toLowerCase().includes("id")) {
        sampleData[column] = "ID-12345"
      } else {
        sampleData[column] = `Sample ${column}`
      }
    })

    return sampleData
  }

  const handlePreview = () => {
    setPreviewData(generateSampleData())
    setActiveTab("preview")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-base">
            Email Subject
          </Label>
          <Input
            id="subject"
            placeholder="Enter email subject line"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          {columns.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-1">Insert variable into subject:</p>
              <div className="flex flex-wrap gap-2">
                {columns.map((column) => (
                  <Badge
                    key={column}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleSubjectVariableInsert(column)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {column}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit Template</TabsTrigger>
            <TabsTrigger value="preview" disabled={!template}>
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="template" className="text-base">
                Email Template
              </Label>
              <Textarea
                id="template"
                placeholder="Enter your email template here. Use {column_name} to insert data from your Excel file."
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="min-h-[250px] font-mono text-sm"
              />
            </div>

            {columns.length > 0 ? (
              <div className="mt-4 p-4 border rounded-md bg-muted/30">
                <p className="text-sm font-medium mb-2">Available variables:</p>
                <div className="flex flex-wrap gap-2">
                  {columns.map((column) => (
                    <Badge
                      key={column}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => insertVariable(column)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {column}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-4 border rounded-md bg-muted/20">
                <p className="text-sm text-muted-foreground">Upload an Excel file first to see available variables.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="pt-4">
            <Card className="border border-muted-foreground/20">
              <CardContent className="p-6">
                <div className="border-b pb-2 mb-4">
                  <h3 className="font-medium">Subject: {processTemplate(subject, previewData)}</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  {processTemplate(template, previewData)
                    .split("\n")
                    .map((line, i) => (
                      <p key={i}>{line || <br />}</p>
                    ))}
                </div>
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This is a preview with sample data. Actual emails will use your Excel data.
            </p>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap gap-3 justify-end mt-6">
          <Button variant="outline" onClick={handlePreview} disabled={!template} className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button onClick={saveTemplate} disabled={!template || !subject} className="gap-2">
            <Save className="h-4 w-4" />
            Save Template
          </Button>
        </div>
      </div>
    </div>
  )
}
