import { z } from "zod/v4"
import { randomUUID } from "crypto"
import { saveCaso } from "@/lib/kv"
import { sendClaim, notifyTeam } from "@/lib/resend"
import { notifyWhatsApp } from "@/lib/whatsapp"
import { CORS_HEADERS, corsResponse } from "@/lib/cors"
import type { Caso } from "@/lib/types"

export const runtime = "nodejs"

export async function OPTIONS() {
  return corsResponse()
}

const Body = z.object({
  empresa: z.string().min(1),
  articulosVulnerados: z.array(z.string()).min(1),
  tipoInfraccion: z.enum(["leve", "grave", "gravisima"]),
  sancionMaxima: z.string(),
  canalRecomendado: z.enum(["empresa_directa", "agencia", "tribunal"]),
  borrador: z.string().min(1),
  cmfVerificado: z.boolean().default(false),
  userEmail: z.string().optional(),
  userName: z.string().optional(),
  phone: z.string().optional(),
  // correo destino del reclamo — si no se envía, usa MOCK_BANK_EMAIL del servidor
  recipientEmail: z.string().optional(),
})

export async function POST(req: Request) {
  let body: z.infer<typeof Body>
  try {
    body = Body.parse(await req.json())
  } catch (err) {
    return Response.json(
      { error: "Datos inválidos", detail: String(err) },
      { status: 400, headers: CORS_HEADERS },
    )
  }

  const id = randomUUID()
  const sentAt = new Date().toISOString()
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const caso: Caso = {
    id,
    phone: body.phone,
    userEmail: body.userEmail,
    userName: body.userName,
    empresa: body.empresa,
    articulosVulnerados: body.articulosVulnerados,
    tipoInfraccion: body.tipoInfraccion,
    sancionMaxima: body.sancionMaxima,
    canalRecomendado: body.canalRecomendado,
    borrador: body.borrador,
    cmfVerificado: body.cmfVerificado,
    status: "enviado",
    sentAt,
    dueDate,
    updatedAt: sentAt,
  }

  const recipientEmail =
    body.recipientEmail ?? process.env.MOCK_BANK_EMAIL ?? ""

  if (!recipientEmail) {
    return Response.json(
      { error: "No hay correo destino configurado. Agrega MOCK_BANK_EMAIL al .env.local." },
      { status: 400, headers: CORS_HEADERS },
    )
  }

  try {
    await sendClaim(caso, recipientEmail)
    await saveCaso(id, caso)

    notifyTeam({
      subject: `[Defensor] Reclamo enviado — ${caso.empresa}`,
      html: `<p>Nuevo reclamo enviado.</p>
             <p><strong>Empresa:</strong> ${caso.empresa}</p>
             <p><strong>Artículos:</strong> ${caso.articulosVulnerados.join(", ")}</p>
             <p><strong>ID:</strong> ${id}</p>
             <p><strong>Vencimiento:</strong> ${new Date(dueDate).toLocaleDateString("es-CL")}</p>`,
    }).catch(console.error)

    if (body.phone) {
      notifyWhatsApp({ type: "caso_enviado", to: body.phone, data: { caso } }).catch(
        console.error,
      )
    }

    return Response.json(
      { casoId: id, sentAt, dueDate },
      { status: 201, headers: CORS_HEADERS },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return Response.json(
      { error: message },
      { status: 500, headers: CORS_HEADERS },
    )
  }
}
