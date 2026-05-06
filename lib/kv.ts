import { kv } from "@vercel/kv"
import type { Caso, WhatsAppSession } from "./types"

const TTL_30D = 60 * 60 * 24 * 30
const TTL_7D = 60 * 60 * 24 * 7

// ── Casos (reclamos) ────────────────────────────────────────────────────────

export async function saveCaso(id: string, data: Caso): Promise<void> {
  await kv.set(`caso:${id}`, data, { ex: TTL_30D })
}

export async function getCaso(id: string): Promise<Caso | null> {
  return kv.get<Caso>(`caso:${id}`)
}

export async function updateCasoStatus(
  id: string,
  status: Caso["status"],
): Promise<void> {
  const existing = await getCaso(id)
  if (!existing) throw new Error(`Caso ${id} no encontrado`)
  await saveCaso(id, { ...existing, status, updatedAt: new Date().toISOString() })
}

export async function getAllCasos(): Promise<Caso[]> {
  const keys = await kv.keys("caso:*")
  const results: Caso[] = []
  for (const key of keys) {
    const data = await kv.get<Caso>(key)
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
  await kv.set(`session:wa:${phone}`, session, { ex: TTL_7D })
}

export async function getSession(
  phone: string,
): Promise<WhatsAppSession | null> {
  return kv.get<WhatsAppSession>(`session:wa:${phone}`)
}

export async function deleteSession(phone: string): Promise<void> {
  await kv.del(`session:wa:${phone}`)
}
