"use server"

import { mailTransport } from "./mailer"

interface EmailObject {
  to: string
  subject: string
  message: string
}

interface AttachmentObject {
  filename: string
  content: Buffer | string
  contentType?: string
}

interface SendEmailBlastParams {
  emails: EmailObject[]
  attachments?: AttachmentObject[]
}

interface EmailBlastResult {
  success: boolean
  sentCount: number
  errors?: string[]
}

export async function sendEmailBlast({ emails, attachments }: SendEmailBlastParams): Promise<EmailBlastResult> {
  const validEmails = emails.filter((email) => {
    return email.to && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.to)
  });

  const resolves = await Promise.all(validEmails.map(m => mailTransport.sendMail({
    to: m.to,
    subject: m.subject,
    text: m.message,
    attachments: attachments && attachments.length > 0 ? attachments : undefined,
  }).catch(() => undefined)));

  return {
    sentCount: resolves.filter(n => n).length,
    success: true,
    errors: [],
  }
}
