import { NextResponse } from "next/server"
import { getAllTrackedEmails } from "@/lib/email-agent-kv"

const VALID_STATUSES = [
  "esperando_respuesta",
  "esperando_aprobacion",
  "aprobado",
  "respondido",
] as const

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const q = (searchParams.get("q") || "").trim().toLowerCase()
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const pageSize = Math.max(1, Math.min(100, parseInt(searchParams.get("pageSize") || "10", 10)))

    const all = await getAllTrackedEmails()
    all.sort(
      (a, b) => new Date(b.updatedAt || b.sentAt).getTime() - new Date(a.updatedAt || a.sentAt).getTime(),
    )

    const counts = {
      esperando_respuesta: 0,
      esperando_aprobacion: 0,
      aprobado: 0,
      respondido: 0,
    }
    for (const e of all) {
      if (e.status in counts) counts[e.status]++
    }

    let filtered = all
    if (status && VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      filtered = filtered.filter((e) => e.status === status)
    }
    if (q) {
      filtered = filtered.filter(
        (e) =>
          e.recipientEmail.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q) ||
          e.recipientName.toLowerCase().includes(q),
      )
    }

    const total = filtered.length
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)
    return NextResponse.json({ items, total, page, pageSize, counts })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error inesperado" },
      { status: 500 },
    )
  }
}
