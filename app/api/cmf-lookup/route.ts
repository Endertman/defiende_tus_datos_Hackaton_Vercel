import { lookupEmpresa } from "@/lib/cmf"
import { CORS_HEADERS, corsResponse } from "@/lib/cors"

export const runtime = "nodejs"

export async function OPTIONS() {
  return corsResponse()
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const nombre = searchParams.get("nombre")

  if (!nombre?.trim()) {
    return Response.json(
      { error: "Parámetro 'nombre' requerido" },
      { status: 400, headers: CORS_HEADERS },
    )
  }

  const result = lookupEmpresa(nombre.trim())
  return Response.json(result, { headers: CORS_HEADERS })
}
