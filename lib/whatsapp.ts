import twilio from "twilio"
import type { Caso } from "./types"

let _client: ReturnType<typeof twilio> | null = null

function getClient() {
  if (_client) return _client
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) return null
  _client = twilio(sid, token)
  return _client
}

function fmt(iso?: string) {
  try {
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Santiago",
    }).format(iso ? new Date(iso) : new Date())
  } catch {
    return new Date().toLocaleDateString("es-CL")
  }
}

async function send(to: string, body: string) {
  const tw = getClient()
  const from = process.env.TWILIO_WHATSAPP_FROM
  if (!tw || !from) {
    console.log("[whatsapp] Omitido: faltan variables Twilio")
    return { skipped: true }
  }
  try {
    const msg = await tw.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
      body,
    })
    return { sid: msg.sid }
  } catch (err) {
    console.error("[whatsapp]", err instanceof Error ? err.message : err)
    return { error: String(err) }
  }
}

export async function notifyReclamoCreadO(to: string, caso: Caso) {
  return send(
    to,
    `✅ Tu reclamo contra *${caso.empresa}* fue enviado.\n` +
      `N° seguimiento: ${caso.id}\n` +
      `Tienen hasta el *${new Date(caso.dueDate).toLocaleDateString("es-CL")}* para responderte (30 días según Art. 11).\n` +
      `Te avisaré si no responden a tiempo.`,
  )
}

export async function notifyPlazoVencido(to: string, caso: Caso) {
  return send(
    to,
    `⏰ *Plazo vencido* — ${caso.empresa} no respondió tu reclamo en 30 días.\n` +
      `Puedes escalar a la Agencia de Protección de Datos. ¿Quieres que prepare el documento?`,
  )
}

export async function notifyWhatsApp({
  type,
  to,
  data,
}: {
  type: "caso_enviado" | "plazo_vencido" | "custom"
  to: string
  data?: Record<string, unknown>
}) {
  if (type === "caso_enviado" && data?.caso) {
    return notifyReclamoCreadO(to, data.caso as Caso)
  }
  if (type === "plazo_vencido" && data?.caso) {
    return notifyPlazoVencido(to, data.caso as Caso)
  }
  if (type === "custom" && data?.body) {
    return send(to, String(data.body))
  }
}

export async function sendWhatsAppReply(to: string, body: string) {
  return send(to, body)
}
