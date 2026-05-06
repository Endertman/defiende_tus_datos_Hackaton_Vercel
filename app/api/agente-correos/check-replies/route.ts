import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getPendingTrackedEmails, updateTrackedEmailStatus } from "@/lib/email-agent-kv"
import { notifyAgentOwner } from "@/lib/email-agent-mail"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const FOLLOWUP_PROMPT = `Redacta un correo de seguimiento profesional y breve.
Devuelve solamente HTML.`

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const pending = await getPendingTrackedEmails()
    const processed: Array<{ id: string; action: string }> = []

    for (const email of pending) {
      if (email.repliedAt) {
        await updateTrackedEmailStatus(email.id, "respondido")
        processed.push({ id: email.id, action: "marked_replied" })
        continue
      }
      if (email.status === "esperando_aprobacion") continue

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1000,
        system: FOLLOWUP_PROMPT,
        messages: [
          {
            role: "user",
            content: `Correo de seguimiento para ${email.recipientEmail}. Asunto original: ${email.subject}. Contexto: ${email.context}.`,
          },
        ],
      })
      const followUpHtml =
        message.content[0]?.type === "text" ? message.content[0].text : "<p>Solo quería hacer seguimiento.</p>"
      await updateTrackedEmailStatus(email.id, "esperando_aprobacion", { followUpHtml })

      const approvalUrl = `${process.env.BASE_URL}/api/agente-correos/approve-followup?id=${email.id}`
      await notifyAgentOwner({
        subject: `[Agente Correos] Aprobar seguimiento para ${email.recipientEmail}`,
        html: `<p>Se generó un follow-up para ${email.recipientEmail}.</p><p><a href="${approvalUrl}">Aprobar envío</a></p>`,
      })
      processed.push({ id: email.id, action: "followup_pending_approval" })
    }

    return NextResponse.json({ processed: processed.length, results: processed })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    )
  }
}
