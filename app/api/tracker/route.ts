import { getAllCasos, getOverdueCasos, updateCasoStatus } from "@/lib/kv"
import { notifyWhatsApp } from "@/lib/whatsapp"
import { CORS_HEADERS, corsResponse } from "@/lib/cors"

export const runtime = "nodejs"

export async function OPTIONS() {
  return corsResponse()
}

// GET /api/tracker — listar todos los casos con estado y tiempos restantes
export async function GET() {
  try {
    const casos = await getAllCasos()
    const now = new Date()

    const enriched = casos.map((c) => {
      const due = new Date(c.dueDate)
      const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { ...c, daysLeft }
    })

    enriched.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )

    return Response.json(enriched, { headers: CORS_HEADERS })
  } catch (err) {
    return Response.json(
      { error: String(err) },
      { status: 500, headers: CORS_HEADERS },
    )
  }
}

// POST /api/tracker/run-now — disparar manualmente la verificación de plazos (demo)
export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret")
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const vencidos = await getOverdueCasos()
    const results = []

    for (const caso of vencidos) {
      await updateCasoStatus(caso.id, "vencido")

      if (caso.phone) {
        await notifyWhatsApp({
          type: "plazo_vencido",
          to: caso.phone,
          data: { caso },
        })
      }

      results.push({ casoId: caso.id, empresa: caso.empresa, phone: caso.phone })
    }

    return Response.json(
      { procesados: results.length, casos: results },
      { headers: CORS_HEADERS },
    )
  } catch (err) {
    return Response.json(
      { error: String(err) },
      { status: 500, headers: CORS_HEADERS },
    )
  }
}
