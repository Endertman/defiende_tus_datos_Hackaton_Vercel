import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAgentEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL ?? "onboarding@resend.dev",
    to,
    subject,
    html,
  })
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`)
  return data
}

export async function notifyAgentOwner({
  subject,
  html,
}: {
  subject: string
  html: string
}) {
  const to = process.env.USER_NOTIFY_EMAIL
  if (!to) return
  return sendAgentEmail({ to, subject, html })
}
