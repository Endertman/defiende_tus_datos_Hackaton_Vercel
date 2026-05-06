/**
 * Smoke test end-to-end: simula la entrevista completa de un caso DICOM
 * (María: deuda pagada, sigue en DICOM) contra los endpoints reales,
 * y verifica que tanto el chat como el validador respondan con sentido.
 *
 * Requiere `npm run dev` en otra terminal (puerto 3000).
 *
 * Uso:
 *   npm run smoke
 *   npm run smoke -- --base http://localhost:3001    # otro puerto
 */

const DEFAULT_BASE = "http://localhost:3000"

type Phase = "intake" | "canal" | "entrevista" | "revisando" | "entrega"
type Msg = { role: "user" | "assistant"; content: string }

function getBase(): string {
  const ix = process.argv.indexOf("--base")
  if (ix >= 0 && process.argv[ix + 1]) return process.argv[ix + 1]
  return DEFAULT_BASE
}

async function sendChat(
  base: string,
  fase: Phase,
  messages: Msg[],
): Promise<string> {
  const res = await fetch(`${base}/api/chat-legal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fase, messages }),
  })
  if (!res.ok) {
    throw new Error(`chat-legal ${res.status}: ${await res.text()}`)
  }
  if (!res.body) throw new Error("chat-legal: respuesta sin body")
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let out = ""
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    out += decoder.decode(value, { stream: true })
  }
  return out.trim()
}

async function sendValidate(base: string, messages: Msg[]) {
  const res = await fetch(`${base}/api/validate-claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  })
  if (!res.ok) {
    throw new Error(`validate-claim ${res.status}: ${await res.text()}`)
  }
  return {
    body: await res.json(),
    cacheRead: res.headers.get("x-cache-read"),
    cacheWrite: res.headers.get("x-cache-write"),
  }
}

function divider(title: string) {
  console.log(`\n${"━".repeat(70)}`)
  console.log(`  ${title}`)
  console.log("━".repeat(70))
}

async function main() {
  const base = getBase()
  console.log(`🩺 Smoke test → ${base}\n`)

  // El historial se va construyendo turno a turno como en producción.
  const history: Msg[] = []

  /* ─────── FASE 1: INTAKE ─────── */
  divider("FASE 1 — INTAKE")
  history.push({
    role: "user",
    content:
      "Hola, tengo un problema. Aparezco en DICOM por una deuda con un banco que ya pagué hace 4 meses, pero no me han sacado del registro y no puedo abrir cuentas en otros bancos.",
  })
  let asst = await sendChat(base, "intake", history)
  console.log(`👤 Usuario: ${history[0].content}`)
  console.log(`🤖 Asistente:\n${asst}\n`)
  history.push({ role: "assistant", content: asst })

  /* ─────── FASE 2: CANAL ─────── */
  divider("FASE 2 — CANAL")
  history.push({
    role: "user",
    content: "Sí, quiero saber qué puedo hacer.",
  })
  asst = await sendChat(base, "canal", history)
  console.log(`🤖 Asistente (canal):\n${asst}\n`)
  history.push({ role: "assistant", content: asst })

  /* ─────── FASE 3: ENTREVISTA ─────── */
  divider("FASE 3 — ENTREVISTA (5 preguntas)")
  const respuestas = [
    "Sí, dale.",
    "Banco Estado, RUT 97.030.000-7.",
    "Mi RUT y datos financieros — específicamente que aparezco con deuda morosa.",
    "Pagué la deuda completa en enero 2026 y nunca actualizaron el registro. Sigue figurando como impaga en DICOM.",
    "Hace 4 meses, en enero 2026.",
    "Sí, llamé al call center del banco hace 2 meses. Me dijeron que iban a 'gestionarlo' y nunca pasó nada.",
  ]
  for (const r of respuestas) {
    history.push({ role: "user", content: r })
    asst = await sendChat(base, "entrevista", history)
    console.log(`👤: ${r}`)
    console.log(`🤖: ${asst}\n`)
    history.push({ role: "assistant", content: asst })
  }

  /* ─────── FASE 4: REVISIÓN (validate-claim) ─────── */
  divider("REVISIÓN — /api/validate-claim")
  const t0 = Date.now()
  const review = await sendValidate(base, history)
  const elapsed = Date.now() - t0

  console.log(`⏱  ${elapsed}ms (cache_read=${review.cacheRead}, cache_write=${review.cacheWrite})\n`)
  console.log(JSON.stringify(review.body, null, 2))

  /* ─────── Validación de calidad ─────── */
  divider("VALIDACIÓN")
  const r = review.body as {
    suficiente: boolean
    articulos_vulnerados: string[]
    tipo_infraccion: string
    sancion_maxima: string
    canal_recomendado: string
    pregunta_faltante: string | null
    borrador_reclamo: string | null
  }
  const checks: Array<[string, boolean, string]> = [
    ["suficiente=true", r.suficiente === true, String(r.suficiente)],
    [
      "articulos_vulnerados no vacío",
      r.articulos_vulnerados.length > 0,
      r.articulos_vulnerados.join(", "),
    ],
    [
      "canal=empresa_directa o agencia",
      ["empresa_directa", "agencia"].includes(r.canal_recomendado),
      r.canal_recomendado,
    ],
    [
      "borrador_reclamo presente y > 200 chars",
      !!r.borrador_reclamo && r.borrador_reclamo.length > 200,
      `${r.borrador_reclamo?.length ?? 0} chars`,
    ],
    [
      "menciona DICOM o Banco Estado en borrador",
      !!r.borrador_reclamo &&
        /(DICOM|Banco Estado|Boletín)/i.test(r.borrador_reclamo),
      "",
    ],
  ]
  for (const [name, ok, value] of checks) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${value ? ` → ${value}` : ""}`)
  }

  const allPass = checks.every(([, ok]) => ok)
  console.log(`\n${allPass ? "🎉 TODO OK" : "⚠️  HAY FALLOS — revisar arriba"}`)
  process.exit(allPass ? 0 : 1)
}

main().catch((err) => {
  console.error("\n💥 ERROR:", err)
  process.exit(1)
})
