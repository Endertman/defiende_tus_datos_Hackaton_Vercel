import path from "path"
import fs from "fs"

interface CmfEntry {
  nombre: string
  rut: string
  tipo: string
  estado: string
}

let _cache: CmfEntry[] | null = null

function loadCsv(): CmfEntry[] {
  if (_cache) return _cache
  const filePath = path.join(process.cwd(), "knowledge", "cmf_instituciones.csv")
  if (!fs.existsSync(filePath)) return []
  const lines = fs.readFileSync(filePath, "utf-8").split("\n").slice(1)
  _cache = lines
    .filter((l) => l.trim())
    .map((line) => {
      const [nombre = "", rut = "", tipo = "", estado = ""] = line
        .split(";")
        .map((c) => c.trim().replace(/^"|"$/g, ""))
      return { nombre, rut, tipo, estado }
    })
  return _cache
}

export function lookupEmpresa(nombre: string): {
  encontrada: boolean
  entry?: CmfEntry
  mensaje: string
} {
  const instituciones = loadCsv()
  if (!instituciones.length) {
    return {
      encontrada: false,
      mensaje: "Base CMF no disponible — se omite verificación.",
    }
  }
  const query = nombre.toLowerCase()
  const match = instituciones.find(
    (e) =>
      e.nombre.toLowerCase().includes(query) ||
      query.includes(e.nombre.toLowerCase()),
  )
  if (match) {
    return {
      encontrada: true,
      entry: match,
      mensaje: `✓ ${match.nombre} está registrada en CMF como "${match.tipo}" (estado: ${match.estado}).`,
    }
  }
  return {
    encontrada: false,
    mensaje: `${nombre} no aparece en el registro CMF. Verifica el nombre o RUT.`,
  }
}
