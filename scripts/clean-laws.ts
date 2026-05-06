/**
 * Limpia los textos crudos de BCN y los convierte en .md listos para ingesta.
 *
 * Input:  knowledge/raw/{ley_19628,ley_21521,ley_21719}.md  (texto plano BCN)
 * Output: knowledge/{19628,21521,21719}.md                  (markdown estructurado)
 *
 * Qué hace:
 *  - Normaliza whitespace (BCN indenta con 5+ espacios; condensa líneas en blanco).
 *  - Quita ruido UI ("Ver diferencias", "Ver texto diferido", fechas sueltas).
 *  - Marca headers para que el chunker preserve breadcrumbs:
 *      # Ley N° X — <título>           (h1, set una sola vez)
 *      ## TÍTULO X / Título Preliminar  (h2, secciones)
 *      ## Artículo primero/segundo.-    (h2, modificatorios en 21.719)
 *      ## Disposiciones transitorias    (h2)
 *      ### Artículo N°.-                (h3, sustantivos)
 *  - Elimina el preámbulo no-normativo ("Teniendo presente...", "Proyecto de ley:").
 *  - Agrega frontmatter con type/fuente/vigencia para que ingest.ts haga su trabajo.
 *
 * Lo que NO hace: editar contenido legal. Solo formato.
 *
 * Uso:
 *   npm run clean-laws
 *   tsx scripts/clean-laws.ts
 */

import fs from "node:fs"
import path from "node:path"

const RAW_DIR = path.join(process.cwd(), "knowledge", "raw")
const OUT_DIR = path.join(process.cwd(), "knowledge")

type LawConfig = {
  source: string // "19.628"
  rawFile: string
  outFile: string
  vigencia: "actual" | "futura"
  nombre: string
}

const LAWS: LawConfig[] = [
  {
    source: "19.628",
    rawFile: "ley_19628.md",
    outFile: "19628.md",
    vigencia: "actual",
    nombre:
      "Sobre protección de la vida privada (texto vigente hasta 13-DIC-2026)",
  },
  {
    source: "21.521",
    rawFile: "ley_21521.md",
    outFile: "21521.md",
    vigencia: "actual",
    nombre:
      "Promueve la competencia e inclusión financiera a través de innovación y tecnología (Ley Fintec)",
  },
  {
    source: "21.719",
    rawFile: "ley_21719.md",
    outFile: "21719.md",
    vigencia: "futura",
    nombre:
      "Regula la protección y tratamiento de los datos personales y crea la Agencia de Protección de Datos Personales (vigor 13-DIC-2026)",
  },
]

// Líneas-basura que BCN arrastra al exportar HTML→texto.
const NOISE_LINES = new Set([
  "Ver diferencias",
  "Ver texto diferido",
  "Ver modificatoria",
  "Ver texto",
])

// Fechas sueltas que aparecen separadas del texto que las cita.
// Ej: "01-DIC-2026", "13.12.2024".
const STANDALONE_DATE =
  /^(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4}|\d{1,2}-[A-Z]{3}-\d{4})$/

// Headers de metadata BCN si aparecen.
const BCN_META_LINE =
  /^(Tipo Norma|Fecha Publicación|Fecha Promulgación|Organismo|Título|Tipo Versión|Inicio Vigencia|Id Norma|URL):/i

function cleanText(raw: string, cfg: LawConfig): string {
  // 1. Normalizar EOL.
  const rawLines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n")

  // 2. Strip leading/trailing whitespace por línea (BCN usa 5+ espacios).
  const trimmed = rawLines.map((l) => l.replace(/[\t ]+$/, "").replace(/^[\t ]+/, ""))

  // 3. Quitar ruido UI, fechas sueltas, metadata BCN.
  const denoised = trimmed.filter((l) => {
    if (l === "") return true
    if (NOISE_LINES.has(l)) return false
    if (STANDALONE_DATE.test(l)) return false
    if (BCN_META_LINE.test(l)) return false
    return true
  })

  // 4. Collapse blank lines: 2+ → 1.
  const collapsed: string[] = []
  let prevBlank = false
  for (const l of denoised) {
    const isBlank = l === ""
    if (isBlank && prevBlank) continue
    collapsed.push(l)
    prevBlank = isBlank
  }

  // 5. Marcar headers (puede expandir 1 línea en 2: header + body).
  // State: una vez que entramos a DISPOSICIONES TRANSITORIAS, los
  // "Artículo primero/segundo/...-" son artículos transitorios (### no ##).
  const marked: string[] = []
  let inTransitorias = false
  for (const l of collapsed) {
    const out = markHeader(l, inTransitorias)
    const lines = Array.isArray(out) ? out : [out]
    for (const x of lines) {
      if (/^## DISPOSICIONES TRANSITORIAS|^## Disposiciones transitorias/.test(x)) {
        inTransitorias = true
      }
      marked.push(x)
    }
  }

  // 6. Eliminar preámbulo: descartar todo antes del primer header (## o ###).
  const firstHeaderIdx = marked.findIndex((l) => /^#{2,3}\s/.test(l))
  const body = firstHeaderIdx >= 0 ? marked.slice(firstHeaderIdx) : marked

  // 7. Componer salida con frontmatter + h1.
  const frontmatter = [
    "---",
    `type: ley`,
    `fuente: ${cfg.source}`,
    `vigencia: ${cfg.vigencia}`,
    `nombre: "${cfg.nombre.replace(/"/g, '\\"')}"`,
    "---",
    "",
    `# Ley N° ${cfg.source} — ${cfg.nombre}`,
    "",
  ].join("\n")

  return frontmatter + body.join("\n").trim() + "\n"
}

/**
 * Devuelve la línea original (string) o un array [header, body] si detectó
 * un patrón de artículo / título.
 *
 * @param inTransitorias true si ya pasamos por "DISPOSICIONES TRANSITORIAS"
 *  en este archivo. En ese caso los Artículos ordinales son transitorios (h3).
 */
function markHeader(
  line: string,
  inTransitorias: boolean,
): string | string[] {
  if (line === "") return line
  if (/^#{1,6}\s/.test(line)) return line // ya es header (idempotencia)

  // Quitar comilla inicial si la línea empieza con `"` (BCN deja comillas
  // de cierre/apertura cuando un texto está dentro de una modificación).
  const stripped = line.replace(/^["“”]/, "")

  // Heurística clave: una línea es un header de sección sólo si es CORTA.
  // Un párrafo de un artículo puede empezar con "Título III de esta ley..."
  // pero su largo total los descalifica como sección.
  const isShort = stripped.length <= 60

  // ── Disposiciones transitorias ───────────────────────────────────
  if (/^DISPOSICIONES\s+TRANSITORIAS/i.test(stripped) && isShort) {
    return `## DISPOSICIONES TRANSITORIAS`
  }
  if (/^Disposiciones\s+transitorias\b/i.test(stripped) && isShort) {
    return `## Disposiciones transitorias`
  }

  // ── TÍTULO X / Título Preliminar ─────────────────────────────────
  // Estricto: la línea debe ser SOLO "Título <numeral>" (con punto opcional al
  // final). Evita matchear referencias dentro de párrafos como
  // "Título III de esta ley." o "el siguiente nuevo Título XXIX".
  // Numerales romanos limitados a I–XX (suficiente para cualquier ley chilena).
  const ROMAN_OK =
    "(?:Preliminar|Final|I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)"
  const titleStrict = new RegExp(
    `^(?:TÍTULO|Título)\\s+${ROMAN_OK}\\s*\\.?["”]?\\s*$`,
    "i",
  )
  if (titleStrict.test(stripped) && isShort) {
    return `## ${stripped.replace(/["”.]+$/, "").trim()}`
  }

  // ── Párrafo (subdivisión dentro de un Título) ────────────────────
  if (/^Párrafo\s+\d/i.test(stripped) && isShort) {
    return `## ${stripped.replace(/["”]+$/, "").trim()}`
  }

  // ── Artículos modificatorios (ordinales: primero, segundo…) ──────
  // Si estamos dentro de DISPOSICIONES TRANSITORIAS, son transitorios → ###.
  // Si no, son artículos modificatorios principales (ej. 21.719) → ##.
  const modif =
    /^Artículo\s+(primero|segundo|tercero|cuarto|quinto|sexto|séptimo|septimo|octavo|noveno|décimo|decimo)\.-\s*/i.exec(
      stripped,
    )
  if (modif) {
    const ord = modif[1].toLowerCase()
    const level = inTransitorias ? "###" : "##"
    const suffix = inTransitorias ? " transitorio" : ""
    const rest = stripped.slice(modif[0].length).trim()
    const header = `${level} Artículo ${ord}${suffix}.-`
    if (rest) return [header, rest]
    return header
  }

  // ── Artículos sustantivos (numéricos: 1°, 8 bis, 30 bis) ─────────
  const sub =
    /^Artículo\s+(\d+)\s*(°|º)?\s*(bis|ter)?\.-\s*/i.exec(stripped)
  if (sub) {
    const num = sub[1]
    const mark = sub[2] ? "°" : ""
    const suffix = sub[3] ? ` ${sub[3].toLowerCase()}` : ""
    const rest = stripped.slice(sub[0].length).trim()
    if (rest) return [`### Artículo ${num}${mark}${suffix}.-`, rest]
    return `### Artículo ${num}${mark}${suffix}.-`
  }

  return stripped
}

function processOne(cfg: LawConfig) {
  const rawPath = path.join(RAW_DIR, cfg.rawFile)
  const outPath = path.join(OUT_DIR, cfg.outFile)
  if (!fs.existsSync(rawPath)) {
    console.warn(`⚠️  ${cfg.rawFile} no existe en knowledge/raw/, salto`)
    return
  }
  const raw = fs.readFileSync(rawPath, "utf-8")
  const cleaned = cleanText(raw, cfg)
  fs.writeFileSync(outPath, cleaned, "utf-8")

  const inKb = (raw.length / 1024).toFixed(1)
  const outKb = (cleaned.length / 1024).toFixed(1)
  const inLines = raw.split("\n").length
  const outLines = cleaned.split("\n").length
  const articulos = (cleaned.match(/^### Artículo /gm) ?? []).length
  const titulos = (cleaned.match(/^## /gm) ?? []).length

  console.log(
    `✓ ${cfg.rawFile} (${inKb}KB, ${inLines}L) → ${cfg.outFile} ` +
      `(${outKb}KB, ${outLines}L, ${titulos} h2, ${articulos} artículos)`,
  )
}

function main() {
  if (!fs.existsSync(RAW_DIR)) {
    console.error(`❌ No existe ${RAW_DIR}`)
    process.exit(1)
  }
  console.log(`📚 Limpiando leyes desde ${RAW_DIR}\n`)
  LAWS.forEach(processOne)
  console.log(`\n✅ Listo. Próximo paso: npm run ingest:dry`)
}

main()
