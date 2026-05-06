// SERNAC data via the datos.gob.cl CKAN API (no API key required).
// The datasets are historical (not real-time), but useful for showing complaint frequency
// and which sectors/companies have the most SERNAC reclamos on record.

const CKAN_BASE = "https://datos.gob.cl/api/3/action"

export interface SernacDataset {
  id: string
  name: string
  title: string
  resources: { id: string; name: string; format: string }[]
}

export interface SernacReclamo {
  empresa?: string
  sector?: string
  motivo?: string
  anio?: string
  [key: string]: unknown
}

// Module-level cache
let _datasets: { data: SernacDataset[]; ts: number } | null = null
let _reclamos: { data: SernacReclamo[]; ts: number } | null = null
const TTL = 24 * 60 * 60 * 1000

// Searches the datos.gob.cl catalog for SERNAC financial complaint datasets.
export async function getSernacDatasets(): Promise<SernacDataset[]> {
  const now = Date.now()
  if (_datasets && now - _datasets.ts < TTL) return _datasets.data

  try {
    const url = new URL(`${CKAN_BASE}/package_search`)
    url.searchParams.set("q", "reclamos financiero")
    url.searchParams.set("fq", "organization:servicio_nacional_del_consumidor")
    url.searchParams.set("rows", "20")

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return []

    const json = await res.json()
    const data: SernacDataset[] = json?.result?.results ?? []
    _datasets = { data, ts: now }
    return data
  } catch {
    return []
  }
}

// Queries a specific CKAN resource by ID and returns records.
export async function queryCkanResource(
  resourceId: string,
  limit = 500,
): Promise<SernacReclamo[]> {
  try {
    const url = new URL(`${CKAN_BASE}/datastore_search`)
    url.searchParams.set("resource_id", resourceId)
    url.searchParams.set("limit", String(limit))

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return []

    const json = await res.json()
    return (json?.result?.records ?? []) as SernacReclamo[]
  } catch {
    return []
  }
}

// Returns complaint counts keyed by company/institution name from the first available dataset.
// Returns empty object if no SERNAC datasets are available.
export async function getSernacReclamoPorEmpresa(): Promise<Record<string, number>> {
  const now = Date.now()
  if (_reclamos && now - _reclamos.ts < TTL) {
    return buildCounts(_reclamos.data)
  }

  const datasets = await getSernacDatasets()
  if (!datasets.length) return {}

  // Pick the first CSV resource found across all datasets
  const csvResource = datasets
    .flatMap((d) => d.resources)
    .find((r) => ["CSV", "XLS", "XLSX"].includes(r.format.toUpperCase()))

  if (!csvResource) return {}

  const records = await queryCkanResource(csvResource.id)
  _reclamos = { data: records, ts: now }
  return buildCounts(records)
}

function buildCounts(records: SernacReclamo[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const rec of records) {
    const empresa = String(
      rec.empresa ?? rec.Empresa ?? rec.institucion ?? rec.Institucion ?? "",
    ).trim()
    if (empresa) counts[empresa] = (counts[empresa] ?? 0) + 1
  }
  return counts
}

// Returns a normalized "reclamo score" (0–100) for a company name against the SERNAC dataset.
// A higher score means more historical complaints → useful as a second input to risk level.
export function sernacScore(
  nombreEmpresa: string,
  counts: Record<string, number>,
): number {
  if (!Object.keys(counts).length) return 0
  const q = nombreEmpresa.toLowerCase()
  const matches = Object.entries(counts).filter(
    ([k]) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()),
  )
  const total = matches.reduce((s, [, v]) => s + v, 0)
  const max = Math.max(...Object.values(counts))
  return max ? Math.round((total / max) * 100) : 0
}
