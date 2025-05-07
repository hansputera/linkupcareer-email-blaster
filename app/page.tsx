"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ProgressSteps } from "@/components/progress-steps"
import { FileUploadStep } from "@/components/file-upload-step"
import { TemplateStep } from "@/components/template-step"
import { PreviewStep } from "@/components/preview-step"
import { ReviewStep } from "@/components/review-step"
import { Toaster } from "@/components/ui/toaster"
import { Mail } from "lucide-react"

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [excelData, setExcelData] = useState<any[]>([])
  const [template, setTemplate] = useState("")
  const [subject, setSubject] = useState("")
  const [emailsToSend, setEmailsToSend] = useState<Array<{ to: string; subject: string; message: string }>>([])
  const [columnMapping, setColumnMapping] = useState<{
    email: string
    name?: string
    [key: string]: string | undefined
  }>({ email: "" })

  const steps = [
    {
      id: "upload",
      title: "Upload Data",
      description: "Upload your Excel file with recipient data",
    },
    {
      id: "template",
      title: "Create Template",
      description: "Design your email template with variables",
    },
    {
      id: "preview",
      title: "Map & Preview",
      description: "Map columns and preview your data",
    },
    {
      id: "review",
      title: "Review & Send",
      description: "Review and send your email campaign",
    },
  ]

  const goToNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const goToStep = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <FileUploadStep setExcelData={setExcelData} onComplete={goToNextStep} />
      case 1:
        return (
          <TemplateStep
            template={template}
            setTemplate={setTemplate}
            subject={subject}
            setSubject={setSubject}
            columns={excelData.length > 0 ? Object.keys(excelData[0]) : []}
            onComplete={goToNextStep}
            onBack={goToPreviousStep}
          />
        )
      case 2:
        return (
          <PreviewStep
            data={excelData}
            columnMapping={columnMapping}
            setColumnMapping={setColumnMapping}
            template={template}
            subject={subject}
            onComplete={(preparedEmails) => {
              setEmailsToSend(preparedEmails)
              goToNextStep()
            }}
            onBack={goToPreviousStep}
          />
        )
      case 3:
        return (
          <ReviewStep
            emailsToSend={emailsToSend}
            template={template}
            subject={subject}
            recipientCount={excelData.length}
            onBack={goToPreviousStep}
            onReset={() => {
              setCurrentStep(0)
              setExcelData([])
              setTemplate("")
              setSubject("")
              setEmailsToSend([])
              setColumnMapping({ email: "" })
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Internal Linkupcareer Email Blaster</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Simple, and quick email blaster by Linkupcareer IT Team
          </p>
        </div>

        <ProgressSteps steps={steps} currentStep={currentStep} onStepClick={goToStep} className="mb-8" />

        <Card className="border-none shadow-md overflow-hidden">{renderStepContent()}</Card>
      </div>
      <Toaster />
    </main>
  )
}
