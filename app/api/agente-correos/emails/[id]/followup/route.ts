import { NextResponse } from "next/server"
import { getTrackedEmail, updateTrackedEmailStatus } from "@/lib/email-agent-kv"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const email = await getTrackedEmail(id)
    if (!email) return NextResponse.json({ error: "Correo no encontrado" }, { status: 404 })
    await updateTrackedEmailStatus(id, "esperando_respuesta", { followUpHtml: null })
    return NextResponse.json(await getTrackedEmail(id))
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    )
  }
}
