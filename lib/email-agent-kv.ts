import type { EmailStatus, TrackedEmail } from "./email-agent-types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _kv: any = null

async function getKv() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) return null
  if (!_kv) {
    const mod = await import("@vercel/kv")
    _kv = mod.kv
  }
  return _kv
}

const TTL_30D = 60 * 60 * 24 * 30

export async function saveTrackedEmail(id: string, data: TrackedEmail): Promise<void> {
  const kv = await getKv()
  if (!kv) return
  await kv.set(`email-agent:${id}`, data, { ex: TTL_30D })
}

export async function getTrackedEmail(id: string): Promise<TrackedEmail | null> {
  const kv = await getKv()
  if (!kv) return null
  return (await kv.get(`email-agent:${id}`)) as TrackedEmail | null
}

export async function updateTrackedEmailStatus(
  id: string,
  status: EmailStatus,
  extra: Partial<TrackedEmail> = {},
): Promise<void> {
  const existing = await getTrackedEmail(id)
  if (!existing) throw new Error(`Email ${id} no encontrado`)
  await saveTrackedEmail(id, {
    ...existing,
    ...extra,
    status,
    updatedAt: new Date().toISOString(),
  })
}

export async function getAllTrackedEmails(): Promise<TrackedEmail[]> {
  const kv = await getKv()
  if (!kv) return []
  const keys = (await kv.keys("email-agent:*")) as string[]
  const out: TrackedEmail[] = []
  for (const key of keys) {
    const data = (await kv.get(key)) as TrackedEmail | null
    if (data) out.push(data)
  }
  return out
}

export async function getPendingTrackedEmails(): Promise<TrackedEmail[]> {
  const all = await getAllTrackedEmails()
  return all.filter(
    (e) => e.status === "esperando_respuesta" || e.status === "esperando_aprobacion",
  )
}
