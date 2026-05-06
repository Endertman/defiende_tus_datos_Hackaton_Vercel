import { NextResponse } from "next/server"
import { getTrackedEmail, updateTrackedEmailStatus } from "@/lib/email-agent-kv"
import { sendAgentEmail } from "@/lib/email-agent-mail"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    const email = await getTrackedEmail(id)
    if (!email) return NextResponse.json({ error: "Correo no encontrado" }, { status: 404 })
    if (!email.followUpHtml) return NextResponse.json({ error: "No hay follow-up" }, { status: 400 })

    await sendAgentEmail({
      to: email.recipientEmail,
      subject: `Re: ${email.subject}`,
      html: email.followUpHtml,
    })
    await updateTrackedEmailStatus(id, "aprobado", { approvedAt: new Date().toISOString() })
    return NextResponse.json(await getTrackedEmail(id))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    )
  }
}
