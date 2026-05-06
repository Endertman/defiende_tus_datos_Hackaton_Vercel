const CMF_BASE = "https://api.cmfchile.cl/api-sbifv3/recursos_api"

export interface CmfInstitucion {
  codigo: string
  nombre: string
}

export interface UtmValue {
  valor: number
  periodo: { anio: string; mes: string }
}

// Module-level cache (persists for the lifetime of the Node process / Vercel function warm instance)
let _instituciones: { data: CmfInstitucion[]; ts: number } | null = null
let _utm: { data: UtmValue; ts: number } | null = null
const TTL = 24 * 60 * 60 * 1000 // 24 hours

function apiKey(): string | null {
  return process.env.CMF_API_KEY ?? null
}

function url(path: string): string {
  return `${CMF_BASE}${path}?apikey=${apiKey()}&formato=json`
}

// Returns the list of CMF-registered banking/financial institutions for the most recent closed month.
// Falls back to empty array if the API key is not set or the request fails.
export async function getCmfInstituciones(): Promise<CmfInstitucion[]> {
  if (!apiKey()) return []

  const now = Date.now()
  if (_instituciones && now - _instituciones.ts < TTL) return _instituciones.data

  // Use 2 months back to ensure data is published
  const d = new Date()
  d.setMonth(d.getMonth() - 2)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")

  try {
    const res = await fetch(url(`/resultados/${year}/${month}/instituciones`), {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const json = await res.json()

    // CMF returns { Instituciones: [ { Institucion: { Codigo, Nombre } } ] }
    // Real API shape: { DescripcionesCodigosDeInstituciones: [{ CodigoInstitucion, NombreInstitucion }] }
    const raw: { CodigoInstitucion: string; NombreInstitucion?: string }[] =
      json?.DescripcionesCodigosDeInstituciones ?? []

    const data: CmfInstitucion[] = raw
      .filter((r) => r.NombreInstitucion)
      .map((r) => ({
        codigo: r.CodigoInstitucion,
        nombre: r.NombreInstitucion!,
      }))

    _instituciones = { data, ts: now }
    return data
  } catch {
    return []
  }
}

// Returns the current UTM value. Used by the legal reviewer to display accurate fine amounts.
export async function getUtm(): Promise<UtmValue | null> {
  if (!apiKey()) return null

  const now = Date.now()
  if (_utm && now - _utm.ts < TTL) return _utm.data

  try {
    const res = await fetch(url("/utm"), { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const json = await res.json()

    // Real API shape: { UTMs: [{ Valor: "70.588", Fecha: "2026-05-01" }] }
    const first = json?.UTMs?.[0]
    if (!first) return null

    // Chilean number format: "70.588" = 70,588 → strip dot, then parse
    const valorStr = String(first.Valor ?? "0").replace(/\./g, "").replace(",", ".")
    const [anio = "", mes = ""] = String(first.Fecha ?? "").split("-")
    const data: UtmValue = {
      valor: parseFloat(valorStr),
      periodo: { anio, mes },
    }

    _utm = { data, ts: now }
    return data
  } catch {
    return null
  }
}

// Words to ignore when comparing company names
const STOP_WORDS = new Set([
  "banco", "chile", "de", "del", "la", "el", "y", "e", "en", "los", "las",
])

// Word-level fuzzy match: extracts significant keywords from the company name and checks
// if any of them appear in the CMF institution list. This handles cases like
// "Santander Chile" → "BANCO SANTANDER-CHILE" and "CMR Falabella" → "BANCO FALABELLA".
export function isCmfRegistered(
  nombreEmpresa: string,
  instituciones: CmfInstitucion[],
): boolean {
  if (!instituciones.length) return false

  const keywords = nombreEmpresa
    .toLowerCase()
    .split(/[\s\-\/()]+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))

  if (!keywords.length) return false

  return instituciones.some((inst) => {
    // Also filter short/stop words from the institution side to avoid matching
    // single letters like the "E" in "BANCO DE CRÉDITO E INVERSIONES"
    const instWords = inst.nombre
      .toLowerCase()
      .split(/[\s\-\/()]+/)
      .filter((w) => w.length >= 4 && !STOP_WORDS.has(w))
    return keywords.some((kw) =>
      instWords.some((iw) => iw.includes(kw) || kw.includes(iw)),
    )
  })
}
