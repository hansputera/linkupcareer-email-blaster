"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, Mail, RefreshCw, Send } from "lucide-react"
import { sendEmailBlast } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

interface ReviewStepProps {
  emailsToSend: Array<{ to: string; subject: string; message: string }>
  template: string
  subject: string
  recipientCount: number
  onBack: () => void
  onReset: () => void
}

export function ReviewStep({ emailsToSend, template, subject, recipientCount, onBack, onReset }: ReviewStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isSent, setIsSent] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const { toast } = useToast()

  const handleSendEmails = async () => {
    if (emailsToSend.length === 0) {
      toast({
        title: "No emails to send",
        description: "There are no valid emails to send",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 100)

      const result = await sendEmailBlast({ emails: emailsToSend })

      clearInterval(progressInterval)
      setProgress(100)
      setSentCount(result.sentCount)
      setIsSent(true)

      toast({
        title: "Success!",
        description: `${result.sentCount} emails have been sent successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send emails. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Review & Send</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {!isSent ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted/30 p-3 border-b">
                      <div className="text-sm font-medium">Campaign Summary</div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Subject</div>
                        <div className="font-medium">{subject}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Recipients</div>
                        <div className="font-medium">{recipientCount} email addresses</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Template Preview</div>
                        <div className="mt-1 p-3 bg-muted/20 rounded-md text-sm max-h-[200px] overflow-y-auto">
                          {template.split("\n").map((line, i) => (
                            <p key={i} className="mb-1">
                              {line || <br />}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <div className="bg-muted/30 p-3 border-b">
                    <div className="text-sm font-medium">Ready to Send</div>
                  </div>
                  <div className="p-6 flex flex-col items-center justify-center text-center h-[calc(100%-48px)]">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Your campaign is ready to send</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      You're about to send {recipientCount} personalized emails
                    </p>
                    <Button size="lg" onClick={handleSendEmails} disabled={isLoading} className="gap-2 w-full">
                      {isLoading ? (
                        <>
                          Sending Emails...
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        </>
                      ) : (
                        <>
                          Send Campaign Now
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {isLoading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">Sending emails... {Math.round(progress)}%</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full mb-4">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Campaign Sent Successfully!</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Your email campaign has been sent to {sentCount} recipients. They should receive it shortly.
              </p>
              <Button onClick={onReset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Create New Campaign
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        {!isSent ? (
          <>
            <Button variant="outline" onClick={onBack} className="gap-2" disabled={isLoading}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div></div>
          </>
        ) : (
          <div></div>
        )}
      </CardFooter>
    </>
  )
}
