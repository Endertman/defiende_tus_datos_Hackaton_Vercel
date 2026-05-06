export type EmailStatus =
  | "esperando_respuesta"
  | "esperando_aprobacion"
  | "aprobado"
  | "respondido"

export interface TrackedEmail {
  id: string
  recipientEmail: string
  recipientName: string
  subject: string
  context: string
  emailHtml: string
  followUpHtml: string | null
  status: EmailStatus
  sentAt: string
  updatedAt: string
  repliedAt?: string
  approvedAt?: string
}

export interface EmailListResponse {
  items: TrackedEmail[]
  total: number
  page: number
  pageSize: number
  counts: Record<EmailStatus, number>
}
