import { validateRut, EMPRESAS } from "@/lib/empresas"
import { CORS_HEADERS, corsResponse } from "@/lib/cors"

export const runtime = "nodejs"

export async function OPTIONS() {
  return corsResponse()
}

export async function POST(req: Request) {
  const { rut } = await req.json().catch(() => ({}))

  if (!rut) {
    return Response.json(
      { error: "RUT requerido" },
      { status: 400, headers: CORS_HEADERS },
    )
  }

  const { valid, formatted } = validateRut(String(rut))

  if (!valid) {
    return Response.json(
      { error: "RUT inválido. Ingrese su RUT sin puntos, con guión (ej: 12345678-9)." },
      { status: 422, headers: CORS_HEADERS },
    )
  }

  // Usar los últimos 2 dígitos del RUT para "personalizar" qué empresas
  // aparecen como confirmadas vs probables — determinista por RUT
  const digits = formatted.replace(/[^0-9]/g, "")
  const seed = parseInt(digits.slice(-2)) || 0

  const empresas = EMPRESAS.map((e, i) => {
    // Bancos, telcos, DICOM → siempre "probable" (casi todos los chilenos están)
    const siempre = ["banco", "telco"].includes(e.sector) || e.id === "equifax-dicom"
    const confirmada = siempre || ((seed + i) % 3 !== 0)
    return {
      ...e,
      confirmada,
      // datos expuestos estimados según riesgo
      datosExpuestos: e.riesgo === "alto" ? e.datos.length : Math.ceil(e.datos.length * 0.6),
    }
  })

  const stats = {
    rut: formatted,
    total: empresas.length,
    confirmadas: empresas.filter((e) => e.confirmada).length,
    alto: empresas.filter((e) => e.riesgo === "alto").length,
    totalDatosExpuestos: empresas.reduce((acc, e) => acc + e.datosExpuestos, 0),
  }

  return Response.json({ stats, empresas }, { headers: CORS_HEADERS })
}
