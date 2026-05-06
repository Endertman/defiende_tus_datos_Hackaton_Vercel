import type { Caso, WhatsAppSession } from "./types"

function isKvReady(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _kv: any = null
async function getKv() {
  if (!isKvReady()) return null
  if (!_kv) {
    const mod = await import("@vercel/kv")
    _kv = mod.kv
  }
  return _kv
}

const TTL_30D = 60 * 60 * 24 * 30
const TTL_7D = 60 * 60 * 24 * 7

// ── Casos (reclamos) ────────────────────────────────────────────────────────

export async function saveCaso(id: string, data: Caso): Promise<void> {
  const kv = await getKv()
  if (!kv) { console.warn("[kv] KV no configurado — caso no persistido"); return }
  await kv.set(`caso:${id}`, data, { ex: TTL_30D })
}

export async function getCaso(id: string): Promise<Caso | null> {
  const kv = await getKv()
  if (!kv) return null
  return (await kv.get(`caso:${id}`)) as Caso | null
}

export async function updateCasoStatus(
  id: string,
  status: Caso["status"],
): Promise<void> {
  const existing = await getCaso(id)
  if (!existing) { console.warn(`[kv] Caso ${id} no encontrado`); return }
  await saveCaso(id, { ...existing, status, updatedAt: new Date().toISOString() })
}

export async function getAllCasos(): Promise<Caso[]> {
  const kv = await getKv()
  if (!kv) return []
  const keys = await kv.keys("caso:*")
  const results: Caso[] = []
  for (const key of keys) {
    const data = (await kv.get(key)) as Caso | null
    if (data) results.push(data)
  }
  return results
}

export async function getOverdueCasos(): Promise<Caso[]> {
  const all = await getAllCasos()
  const now = new Date()
  return all.filter(
    (c) => c.status === "enviado" && new Date(c.dueDate) <= now,
  )
}

// ── Sesiones WhatsApp ───────────────────────────────────────────────────────

export async function saveSession(
  phone: string,
  session: WhatsAppSession,
): Promise<void> {
  const kv = await getKv()
  if (!kv) return
  await kv.set(`session:wa:${phone}`, session, { ex: TTL_7D })
}

export async function getSession(
  phone: string,
): Promise<WhatsAppSession | null> {
  const kv = await getKv()
  if (!kv) return null
  return (await kv.get(`session:wa:${phone}`)) as WhatsAppSession | null
}

export async function deleteSession(phone: string): Promise<void> {
  const kv = await getKv()
  if (!kv) return
  await kv.del(`session:wa:${phone}`)
}
