"use server"

import { mailTransport } from "./mailer"

interface EmailObject {
  to: string
  subject: string
  message: string
}

interface SendEmailBlastParams {
  emails: EmailObject[]
}

interface EmailBlastResult {
  success: boolean
  sentCount: number
  errors?: string[]
}

export async function sendEmailBlast({ emails }: SendEmailBlastParams): Promise<EmailBlastResult> {
  // This is a simulated email sending function
  // In a real application, you would integrate with an email service provider

  // Validate email format
  const validEmails = emails.filter((email) => {
    return email.to && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.to)
  });

  const resolves = await Promise.all(validEmails.map(m => mailTransport.sendMail({
    to: m.to,
    subject: m.subject,
    text: m.message,
  }).catch(() => undefined)));

  return {
    sentCount: resolves.filter(n => n).length,
    success: true,
    errors: [],
  }
}
