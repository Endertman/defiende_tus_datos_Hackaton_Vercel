import twilio from "twilio"

let client: ReturnType<typeof twilio> | null = null

function getClient() {
  if (client) return client
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) return null
  client = twilio(sid, token)
  return client
}

export async function notifyEmailAgentWhatsApp(body: string) {
  const tw = getClient()
  const from = process.env.TWILIO_WHATSAPP_FROM
  const to = process.env.NOTIFY_WHATSAPP_TO
  if (!tw || !from || !to) return { skipped: true }
  try {
    const msg = await tw.messages.create({
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
      body,
    })
    return { sid: msg.sid }
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
}
