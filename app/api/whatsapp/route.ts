import { anthropic, MODEL } from "@/lib/anthropic"
import { loadKnowledge, KNOWLEDGE_CHAT } from "@/lib/knowledge"
import { getSession, saveSession, deleteSession } from "@/lib/kv"
import { sendWhatsAppReply } from "@/lib/whatsapp"
import type { WhatsAppSession } from "@/lib/types"

export const runtime = "nodejs"

// Twilio valida firmas; en producción verificar con twilio.validateRequest
// Para demo/hackathon omitimos la validación para simplicidad

const SYSTEM_WA = `Eres un asistente legal chileno que ayuda personas mayores a reclamar sus derechos sobre datos personales (Ley 21.719). Hablas por WhatsApp.

REGLAS DE ORO:
- Máximo 3 oraciones cortas por respuesta. WhatsApp no es un documento.
- Palabras simples. Nada de términos legales sin explicarlos.
- Tono: como si le hablaras a tu abuela. Calmado, claro, sin apuro.
- Nunca inventes artículos ni multas. Usa solo el knowledge base.

FASES (sigue este orden estrictamente):
1. INTAKE: Saluda brevemente. Pide que cuenten qué pasó con sus datos.
2. CANAL: Explica en 1 párrafo corto a dónde van a reclamar y por qué.
3. ENTREVISTA: Haz UNA sola pregunta por turno, en este orden:
   P1. ¿Nombre de la empresa?
   P2. ¿Qué dato personal les usaron mal? (ej: RUT, correo, historial de pagos)
   P3. ¿Qué hizo exactamente la empresa con ese dato?
   P4. ¿Cuándo ocurrió esto? (una fecha aproximada está bien)
   P5. ¿Ya le mandaron algo a la empresa antes? ¿Respondieron?
   Al terminar P5 di: "Perfecto, voy a revisar tu caso con la ley." — NADA MÁS.
4. ENTREGA: Presenta el reclamo en lenguaje simple. Pregunta si quieren enviarlo.

CONOCIMIENTO LEGAL:
${loadKnowledge(KNOWLEDGE_CHAT)}`

const CONFIRM_PATTERN = /\b(env[íi]alo|enviar|s[íi]|confirmar|dale|ok|ya|confirmo)\b/i
const RESET_PATTERN = /\b(nuevo|reiniciar|empezar|borrar|limpiar|reset)\b/i
const TRANSITION_PHRASE = "voy a revisar tu caso"

function twimlResponse(message: string): Response {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Message></Response>`
  return new Response(xml, {
    headers: { "Content-Type": "text/xml" },
  })
}

export async function POST(req: Request) {
  let from: string, body: string

  const contentType = req.headers.get("content-type") ?? ""
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData()
    from = String(form.get("From") ?? "").replace("whatsapp:", "")
    body = String(form.get("Body") ?? "").trim()
  } else {
    const json = await req.json().catch(() => ({}))
    from = String(json.From ?? "").replace("whatsapp:", "")
    body = String(json.Body ?? "").trim()
  }

  if (!from || !body) {
    return twimlResponse("No pude entender tu mensaje. ¿Puedes repetirlo?")
  }

  // Reset
  if (RESET_PATTERN.test(body)) {
    await deleteSession(from)
    return twimlResponse(
      "Empezamos de nuevo. Cuéntame, ¿qué pasó con tus datos personales?",
    )
  }

  let session: WhatsAppSession = (await getSession(from)) ?? {
    phone: from,
    fase: "intake",
    messages: [],
    updatedAt: new Date().toISOString(),
  }

  // Si está en entrega y hay reclamo guardado y el usuario confirma → enviar
  if (session.fase === "entrega" && session.claim && CONFIRM_PATTERN.test(body)) {
    const mockBankEmail =
      process.env.MOCK_BANK_EMAIL ?? process.env.USER_NOTIFY_EMAIL ?? ""

    if (mockBankEmail) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/send-claim`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...session.claim,
              phone: from,
              recipientEmail: mockBankEmail,
            }),
          },
        )
        const result = await res.json()

        session.casoId = result.casoId
        session.fase = "entrega"
        await saveSession(from, { ...session, updatedAt: new Date().toISOString() })

        return twimlResponse(
          `✅ ¡Reclamo enviado! Tu número de seguimiento es ${result.casoId}. ` +
            `La empresa tiene 30 días para responderte. Te aviso si no responden.`,
        )
      } catch {
        return twimlResponse(
          "Hubo un problema al enviar. Intenta de nuevo o escribe 'nuevo' para empezar.",
        )
      }
    }
  }

  // Llamada normal al agente
  const faseHints: Record<WhatsAppSession["fase"], string> = {
    intake: "FASE ACTUAL: INTAKE. Escucha el problema, no hagas preguntas todavía.",
    canal: "FASE ACTUAL: CANAL. Explica el canal de reclamo en máximo 2 oraciones.",
    entrevista: "FASE ACTUAL: ENTREVISTA. Haz la siguiente pregunta pendiente. Solo una.",
    revisando: "FASE ACTUAL: REVISANDO. Di que estás revisando el caso (1 frase).",
    entrega: "FASE ACTUAL: ENTREGA. Presenta el reclamo en lenguaje simple y pregunta si enviar.",
  }

  const systemMessages = [
    { type: "text" as const, text: SYSTEM_WA, cache_control: { type: "ephemeral" as const } },
    { type: "text" as const, text: faseHints[session.fase] },
  ]

  const messages = [
    ...session.messages,
    { role: "user" as const, content: body },
  ]

  let assistantText = ""
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: systemMessages,
      messages,
    })
    assistantText =
      response.content[0].type === "text" ? response.content[0].text : ""
  } catch (err) {
    console.error("[whatsapp/agent]", err)
    return twimlResponse("Tuve un problema técnico. Intenta de nuevo en un momento.")
  }

  // Actualizar historial
  session.messages = [
    ...messages,
    { role: "assistant", content: assistantText },
  ]

  // Transición de fase
  if (
    session.fase === "intake" &&
    session.messages.filter((m) => m.role === "user").length >= 1
  ) {
    session.fase = "canal"
  } else if (
    session.fase === "canal" &&
    session.messages.filter((m) => m.role === "user").length >= 2
  ) {
    session.fase = "entrevista"
  } else if (
    session.fase === "entrevista" &&
    assistantText.toLowerCase().includes(TRANSITION_PHRASE)
  ) {
    session.fase = "revisando"

    // Llamar al validador
    try {
      const validRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/validate-claim`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: session.messages }),
        },
      )
      const claim = await validRes.json()

      if (claim.suficiente && claim.borrador_reclamo) {
        session.claim = {
          empresa: extractEmpresaFromMessages(session.messages),
          articulosVulnerados: claim.articulos_vulnerados,
          tipoInfraccion: claim.tipo_infraccion,
          sancionMaxima: claim.sancion_maxima,
          canalRecomendado: claim.canal_recomendado,
          borrador: claim.borrador_reclamo,
          cmfVerificado: false,
        }
        session.fase = "entrega"

        const entregaMsg =
          `📋 Revisé tu caso. Encontré que se vulneró el *${claim.articulos_vulnerados.join(", ")}*.\n\n` +
          `Aquí está tu reclamo listo:\n\n${claim.borrador_reclamo.slice(0, 900)}...\n\n` +
          `¿Quieres que lo envíe ahora? Responde *sí* para confirmar.`

        await sendWhatsAppReply(from, entregaMsg)
        await saveSession(from, { ...session, updatedAt: new Date().toISOString() })
        // Twilio requiere 200 + TwiML vacío cuando ya enviamos el mensaje por REST API
        return new Response(
          '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
          { status: 200, headers: { "Content-Type": "text/xml" } },
        )
      }
    } catch (err) {
      console.error("[whatsapp/validate]", err)
    }
  }

  await saveSession(from, { ...session, updatedAt: new Date().toISOString() })
  return twimlResponse(assistantText)
}

function extractEmpresaFromMessages(
  messages: Array<{ role: string; content: string }>,
): string {
  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content)
  // Heurística simple: primer mensaje de usuario suele mencionar la empresa
  const firstMention = userMessages.find((m) => m.length > 5)
  return firstMention?.split(/[\s,\.]/)[0] ?? "Empresa no identificada"
}
