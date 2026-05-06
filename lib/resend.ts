import { Resend } from "resend"
import type { Caso } from "./types"

let _resend: Resend | null = null

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    throw new Error(
      "RESEND_API_KEY no configurada. Agrégala en Vercel Environment Variables para usar envío de correo.",
    )
  }
  if (!_resend) _resend = new Resend(key)
  return _resend
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const { data, error } = await getResend().emails.send({
    from: process.env.FROM_EMAIL ?? "onboarding@resend.dev",
    to,
    subject,
    html,
  })
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`)
  return data
}

export async function sendClaim(caso: Caso, recipientEmail: string) {
  const subject = `Reclamo formal Ley 21.719 — ${caso.empresa}`

  const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>Reclamo</title></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;color:#222;line-height:1.6">
  <div style="background:#1e40af;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:18px">Reclamo Formal — Ley 21.719</h1>
    <p style="margin:4px 0 0;font-size:13px;opacity:0.85">Protección de Datos Personales — Chile</p>
  </div>

  <div style="border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 8px 8px">
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px">
      <tr>
        <td style="padding:6px 0;color:#64748b;width:160px">Empresa reclamada</td>
        <td style="padding:6px 0;font-weight:600">${caso.empresa}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#64748b">Artículos vulnerados</td>
        <td style="padding:6px 0">${caso.articulosVulnerados.join(", ")}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#64748b">Tipo de infracción</td>
        <td style="padding:6px 0;text-transform:capitalize">${caso.tipoInfraccion}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#64748b">Sanción máxima</td>
        <td style="padding:6px 0">${caso.sancionMaxima}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#64748b">N° seguimiento</td>
        <td style="padding:6px 0;font-family:monospace">${caso.id}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#64748b">Plazo respuesta</td>
        <td style="padding:6px 0"><strong>30 días corridos</strong> (Art. 11 Ley 21.719)</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#64748b">Vencimiento</td>
        <td style="padding:6px 0">${new Date(caso.dueDate).toLocaleDateString("es-CL")}</td>
      </tr>
    </table>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">

    <h2 style="font-size:15px;margin-bottom:12px">Texto del reclamo</h2>
    <div style="background:#f8fafc;border-left:4px solid #1e40af;padding:16px;border-radius:4px;white-space:pre-wrap;font-size:14px">${caso.borrador}</div>

    <p style="font-size:12px;color:#94a3b8;margin-top:24px">
      Este reclamo fue generado con ayuda de Defensor de Datos — herramienta basada en la Ley 21.719 de Chile.
      Si la empresa no responde en 30 días, tiene derecho a escalar a la Agencia de Protección de Datos Personales.
    </p>
  </div>
</body>
</html>`

  return sendEmail({ to: recipientEmail, subject, html })
}

export async function notifyTeam({
  subject,
  html,
}: {
  subject: string
  html: string
}) {
  const notifyEmail = process.env.USER_NOTIFY_EMAIL
  if (!notifyEmail) return
  return sendEmail({ to: notifyEmail, subject, html })
}
