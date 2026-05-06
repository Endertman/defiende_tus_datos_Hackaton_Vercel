import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import Anthropic from "@anthropic-ai/sdk"
import { saveTrackedEmail } from "@/lib/email-agent-kv"
import { notifyAgentOwner, sendAgentEmail } from "@/lib/email-agent-mail"
import { notifyEmailAgentWhatsApp } from "@/lib/email-agent-whatsapp"
import type { TrackedEmail } from "@/lib/email-agent-types"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PROMPT = `Eres un asistente especializado en redacción de correos profesionales.
Devuelve únicamente el HTML del cuerpo del correo.`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { recipientEmail, recipientName, context, subject } = body
    if (!recipientEmail || !context || !subject) {
      return NextResponse.json({ error: "recipientEmail, context y subject son requeridos" }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1000,
      system: PROMPT,
      messages: [
        {
          role: "user",
          content: `Redacta un correo para ${recipientName || recipientEmail}. Contexto: ${context}. Asunto: ${subject}.`,
        },
      ],
    })

    const emailHtml = message.content[0]?.type === "text" ? message.content[0].text : "<p>Mensaje</p>"
    await sendAgentEmail({ to: recipientEmail, subject, html: emailHtml })

    const now = new Date().toISOString()
    const record: TrackedEmail = {
      id: randomUUID(),
      recipientEmail,
      recipientName: recipientName || "",
      subject,
      context,
      emailHtml,
      followUpHtml: null,
      status: "esperando_respuesta",
      sentAt: now,
      updatedAt: now,
    }
    await saveTrackedEmail(record.id, record)

    notifyAgentOwner({
      subject: `[Agente Correos] Enviado a ${recipientEmail}`,
      html: `<p>Se envió correo a <strong>${recipientEmail}</strong> (${subject}).</p>`,
    }).catch(() => {})
    notifyEmailAgentWhatsApp(`📤 Correo enviado a ${recipientEmail}\nAsunto: ${subject}`).catch(() => {})

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    )
  }
}
