/**
 * Probe de retrieval: lanza queries canarias contra el índice Upstash y
 * muestra los top chunks con score, source y sección. Útil para verificar
 * que la ingesta esté sana y que el modelo de embeddings entienda
 * preguntas en chileno coloquial.
 *
 * Uso:
 *   npm run probe                 # corre las queries canarias
 *   npm run probe -- "mi query"   # dispara una query custom
 */

import { retrieve } from "../lib/rag"

const QUERIES_CANARIAS = [
  "Aparezco en DICOM por una deuda que ya pagué, ¿qué puedo hacer?",
  "El banco no me responde mi solicitud de eliminar mis datos personales",
  "¿Cuál es el plazo legal que tiene una empresa para responderme sobre mis datos?",
  "Mi banco me pide aceptar términos para usar mis datos en marketing, ¿puedo oponerme?",
  "Una fintech me cerró la cuenta sin avisar y se quedó con mis datos",
  "¿Cuánto puede multar la Agencia de Protección de Datos a un banco?",
  "Quiero portar mis datos de un banco a otro",
]

async function probeOne(query: string) {
  const chunks = await retrieve(query, { topK: 4, minScore: 0.4 })
  console.log(`\n────────────────────────────────────`)
  console.log(`🔎 ${query}`)
  console.log(`────────────────────────────────────`)
  if (chunks.length === 0) {
    console.log("  (sin matches sobre minScore=0.4)")
    return
  }
  chunks.forEach((c, i) => {
    const cite = c.metadata.section
      ? `${c.metadata.source} → ${c.metadata.section}`
      : c.metadata.source
    const preview = c.metadata.text
      .slice(0, 200)
      .replace(/\s+/g, " ")
      .trim()
    console.log(
      `  ${i + 1}. [${c.score.toFixed(3)}] ${cite}\n     "${preview}…"`,
    )
  })
}

async function main() {
  if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
    console.error("❌ Faltan UPSTASH_VECTOR_REST_URL / UPSTASH_VECTOR_REST_TOKEN en .env.local")
    process.exit(1)
  }

  const custom = process.argv.slice(2).filter((a) => !a.startsWith("--"))
  const queries = custom.length > 0 ? custom : QUERIES_CANARIAS

  for (const q of queries) {
    await probeOne(q)
  }
}

main().catch((err) => {
  console.error("❌ Error:", err)
  process.exit(1)
})
