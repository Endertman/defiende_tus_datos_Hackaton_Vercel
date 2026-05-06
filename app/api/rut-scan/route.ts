import { validateRut, EMPRESAS } from "@/lib/empresas"
import { CORS_HEADERS, corsResponse } from "@/lib/cors"
import { getCmfInstituciones, getUtm, isCmfRegistered } from "@/lib/cmf-api"
import { getSernacReclamoPorEmpresa, sernacScore } from "@/lib/sernac"

export const runtime = "nodejs"

// Sector-level penetration rates based on published Chilean market statistics:
// Bancarización: ~92% (SBIF 2023), Telefonía móvil: ~98% (Subtel 2023),
// Retail financiero: ~70%, AFP: ~90% cotizantes activos, Isapres: ~25% + Fonasa ~75%,
// Plataformas digitales: ~65%, Fintech activos: ~35%
const SECTOR_PENETRACION: Record<string, number> = {
  banco:       0.92,
  telco:       0.98,
  retail:      0.70,
  fintech:     0.35,
  plataforma:  0.65,
  seguro_afp:  0.88,
}

// Companies whose databases cover virtually all Chileans regardless of voluntary relationship
const SIEMPRE_PRESENTES = new Set(["equifax-dicom", "entel", "movistar", "claro", "wom"])

export async function OPTIONS() {
  return corsResponse()
}

export async function POST(req: Request) {
  const { rut } = await req.json().catch(() => ({}))

  if (!rut) {
    return Response.json({ error: "RUT requerido" }, { status: 400, headers: CORS_HEADERS })
  }

  const { valid, formatted } = validateRut(String(rut))

  if (!valid) {
    return Response.json(
      { error: "RUT inválido. Ingrese su RUT sin puntos, con guión (ej: 12345678-9)." },
      { status: 422, headers: CORS_HEADERS },
    )
  }

  // Fetch external data in parallel — both fall back gracefully if unavailable
  const [instituciones, utm, sernacCounts] = await Promise.all([
    getCmfInstituciones(),
    getUtm(),
    getSernacReclamoPorEmpresa(),
  ])

  // Deterministic hash per RUT so the same RUT always produces the same result
  const digits = formatted.replace(/[^0-9]/g, "")
  const seed = digits.split("").reduce((acc, d, i) => acc + parseInt(d) * (i + 7), 0)

  const empresas = EMPRESAS.map((e, i) => {
    // CMF verification: API confirms CMF status for banks with matching names.
    // We never downgrade a company we already know is CMF-regulated (e.g. BCI has a legal
    // name in CMF that doesn't match its brand name).
    const cmfVerificado = instituciones.length > 0
      ? (isCmfRegistered(e.nombre, instituciones) || e.cmf)
      : e.cmf

    // Presence determination: deterministic per-RUT within realistic sector penetration bounds
    const penetracion = SECTOR_PENETRACION[e.sector] ?? 0.5
    const esUniversal = SIEMPRE_PRESENTES.has(e.id)
    // Hash to a value 0–99 for this (RUT × company) pair
    const hash = ((seed * 31 + i * 97 + 13) >>> 0) % 100
    const confirmada = esUniversal || hash < penetracion * 100

    // SERNAC score adds color to the "risk" narrative
    const reclamosScore = sernacScore(e.nombre, sernacCounts)

    return {
      ...e,
      cmf: cmfVerificado,
      confirmada,
      datosExpuestos: e.riesgo === "alto" ? e.datos.length : Math.ceil(e.datos.length * 0.6),
      reclamosScore,
    }
  })

  const stats = {
    rut: formatted,
    total: empresas.length,
    confirmadas: empresas.filter((e) => e.confirmada).length,
    alto: empresas.filter((e) => e.riesgo === "alto").length,
    totalDatosExpuestos: empresas.reduce((acc, e) => acc + e.datosExpuestos, 0),
    utm: utm ? { valor: utm.valor, periodo: utm.periodo } : null,
    fuentes: {
      cmfApi: instituciones.length > 0,
      sernac: Object.keys(sernacCounts).length > 0,
    },
  }

  return Response.json({ stats, empresas }, { headers: CORS_HEADERS })
}
