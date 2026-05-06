/**
 * Helpers para construir queries de retrieval desde historial de chat.
 *
 * Heurísticas pragmáticas para hackathon:
 *  - El último mensaje del usuario es la mejor señal de "qué preguntar ahora".
 *  - Para validación de reclamos, mejor concatenar todos los mensajes del usuario
 *    para que el embedding capture el caso completo (empresa, dato, fecha, etc.).
 */

export type ChatTurn = {
  role: "user" | "assistant"
  content: string
}

/** Última intervención del usuario. Cae al penúltimo si la última está vacía. */
export function lastUserMessage(messages: ChatTurn[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role === "user" && m.content.trim().length > 0) return m.content.trim()
  }
  return ""
}

/**
 * Concatena los últimos N turnos del usuario en una sola query.
 * Útil para que retrieval capture el caso completo, no solo la última frase.
 */
export function lastNUserTurns(messages: ChatTurn[], n = 3): string {
  const userTurns = messages.filter((m) => m.role === "user").slice(-n)
  return userTurns.map((m) => m.content.trim()).filter(Boolean).join("\n")
}

/**
 * Query para el revisor: incluye TODO lo que dijo el usuario más alguna pista
 * de qué buscamos (artículos vulnerados, sanciones).
 */
export function transcriptQuery(messages: ChatTurn[]): string {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter(Boolean)
    .join("\n")
  return [
    "Identificar artículos vulnerados, derechos del titular, plazos, canal de reclamo, sanciones.",
    userText,
  ].join("\n\n")
}
