"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Phase } from "@/lib/phases"

// ── Types ──────────────────────────────────────────────────────────────────────

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

export type ClaimReview = {
  suficiente: boolean
  empresa_nombre: string
  articulos_vulnerados: string[]
  tipo_infraccion: "leve" | "grave" | "gravisima"
  sancion_maxima: string
  canal_recomendado: "empresa_directa" | "agencia" | "tribunal"
  pregunta_faltante: string | null
  borrador_reclamo: string | null
  cmf_verificado: boolean
  cmf_mensaje: string | null
}

type PersistedState = {
  messages: ChatMessage[]
  phase: Phase
  reviewResult: ClaimReview | null
  interviewCount: number
}

const STORAGE_KEY = "defensor-datos-state"

// ── Helpers ────────────────────────────────────────────────────────────────────

let idCounter = 0
function uid(): string {
  return `msg-${Date.now()}-${++idCounter}`
}

function persist(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage full or unavailable — ignore
  }
}

function hydrate(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedState
  } catch {
    return null
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useLegalChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [phase, setPhase] = useState<Phase>("intake")
  const [isStreaming, setIsStreaming] = useState(false)
  const [reviewResult, setReviewResult] = useState<ClaimReview | null>(null)
  const [interviewCount, setInterviewCount] = useState(0)
  const [isSendingClaim, setIsSendingClaim] = useState(false)
  const [claimSentId, setClaimSentId] = useState<string | null>(null)

  // Ref to track whether the initial greeting has been sent
  const greetingSent = useRef(false)
  // Ref to always have current values inside callbacks
  const stateRef = useRef({ messages, phase, interviewCount, reviewResult })
  useEffect(() => {
    stateRef.current = { messages, phase, interviewCount, reviewResult }
  })

  // ── Hydrate from localStorage on mount ─────────────────────────────────────

  useEffect(() => {
    const saved = hydrate()
    if (saved && saved.messages.length > 0) {
      setMessages(saved.messages)
      setPhase(saved.phase)
      setReviewResult(saved.reviewResult)
      setInterviewCount(saved.interviewCount)
      greetingSent.current = true
    } else {
      // Send initial greeting
      triggerAssistant([], "intake")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Persist on every meaningful change ─────────────────────────────────────

  useEffect(() => {
    if (messages.length === 0) return
    persist({ messages, phase, reviewResult, interviewCount })
  }, [messages, phase, reviewResult, interviewCount])

  // ── Stream assistant response ──────────────────────────────────────────────

  async function streamChat(
    msgs: ChatMessage[],
    fase: Phase,
  ): Promise<string> {
    const apiMessages = msgs.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    const res = await fetch("/api/chat-legal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMessages, fase }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`chat-legal ${res.status}: ${text}`)
    }

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let accumulated = ""

    // Create placeholder assistant message
    const assistantId = uid()
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ])

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      accumulated += decoder.decode(value, { stream: true })
      const snapshot = accumulated
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: snapshot } : m,
        ),
      )
    }

    return accumulated
  }

  // ── Trigger assistant (no user message, used for greeting & entrega) ───────

  async function triggerAssistant(currentMessages: ChatMessage[], fase: Phase) {
    if (greetingSent.current && fase === "intake" && currentMessages.length === 0) return
    greetingSent.current = true
    setIsStreaming(true)
    try {
      await streamChat(
        currentMessages.length === 0
          ? [{ id: "init", role: "user", content: "Hola" }]
          : currentMessages,
        fase,
      )
    } catch (err) {
      console.error("triggerAssistant error:", err)
      const errorId = uid()
      setMessages((prev) => [
        ...prev,
        {
          id: errorId,
          role: "assistant",
          content: "Lo siento, tuve un problema técnico. Por favor intente de nuevo en un momento.",
        },
      ])
    } finally {
      setIsStreaming(false)
    }
  }

  // ── Validate claim (revisor) ───────────────────────────────────────────────

  async function runValidation(currentMessages: ChatMessage[], currentPhase: Phase): Promise<void> {
    // Transition to "revisando"
    setPhase("revisando")

    try {
      const apiMessages = currentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch("/api/validate-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (!res.ok) {
        throw new Error(`validate-claim ${res.status}`)
      }

      const review: ClaimReview = await res.json()

      if (review.suficiente) {
        // Success path — inject review into context and stream entrega
        setReviewResult(review)
        setPhase("entrega")

        const cmfLinea = review.cmf_mensaje
          ? `\nVerificación CMF: ${review.cmf_mensaje}`
          : ""

        const systemMsg: ChatMessage = {
          id: uid(),
          role: "user",
          content: `[SISTEMA — Hallazgos del Revisor Legal]\n\nEmpresa: ${review.empresa_nombre}\nArtículos vulnerados: ${review.articulos_vulnerados.join(", ")}\nTipo de infracción: ${review.tipo_infraccion}\nSanción máxima: ${review.sancion_maxima}\nCanal recomendado: ${review.canal_recomendado}${cmfLinea}\n\nCarta de reclamo:\n${review.borrador_reclamo}`,
        }

        const updatedMessages = [...currentMessages, systemMsg]
        setMessages(updatedMessages)

        await streamChat(updatedMessages, "entrega")
      } else {
        // Need more info — inject the missing question and go back to entrevista
        setPhase("entrevista")

        const followUp: ChatMessage = {
          id: uid(),
          role: "assistant",
          content: review.pregunta_faltante || "Necesito un dato más para completar su reclamo. ¿Podría darme más detalles?",
        }

        setMessages((prev) => [...prev, followUp])
      }
    } catch (err) {
      console.error("runValidation error:", err)
      // Rollback to entrevista on error
      setPhase("entrevista")
      const errorMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: "Hubo un problema al revisar su caso. ¿Podría repetir el último dato que me contó?",
      }
      setMessages((prev) => [...prev, errorMsg])
    }
  }

  // ── Send user message (main entry point) ───────────────────────────────────

  const sendMessage = useCallback(async (text: string) => {
    if (isStreaming) return
    const { phase: currentPhase, messages: currentMessages, interviewCount: currentCount } = stateRef.current

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text }
    const updatedMessages = [...currentMessages, userMsg]
    setMessages(updatedMessages)

    // Phase transition logic
    let nextPhase = currentPhase
    let nextCount = currentCount

    if (currentPhase === "intake") {
      // After user describes problem → move to canal
      nextPhase = "canal"
      setPhase("canal")
    } else if (currentPhase === "canal") {
      // User said yes to continue → move to entrevista
      nextPhase = "entrevista"
      setPhase("entrevista")
      setInterviewCount(0)
      nextCount = 0
    } else if (currentPhase === "entrevista") {
      nextCount = currentCount + 1
      setInterviewCount(nextCount)
    }

    // Check if we should trigger validation
    if (currentPhase === "entrevista" && nextCount >= 5) {
      // First stream the assistant's brief closing, then validate
      setIsStreaming(true)
      try {
        await streamChat(updatedMessages, "entrevista")
      } catch (err) {
        console.error("Pre-validation stream error:", err)
      }
      setIsStreaming(false)

      // Now run validation with the full updated messages (including the assistant's closing)
      setIsStreaming(true)
      try {
        // Get latest messages after the stream
        const latestMessages = stateRef.current.messages
        await runValidation(latestMessages, nextPhase)
      } finally {
        setIsStreaming(false)
      }
      return
    }

    // Normal flow — stream assistant response
    setIsStreaming(true)
    try {
      await streamChat(updatedMessages, nextPhase)
    } catch (err) {
      console.error("sendMessage stream error:", err)
      const errorId = uid()
      setMessages((prev) => [
        ...prev,
        {
          id: errorId,
          role: "assistant",
          content: "Lo siento, ocurrió un error. Por favor intente de nuevo.",
        },
      ])
    } finally {
      setIsStreaming(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming])

  // ── Enviar reclamo formal ─────────────────────────────────────────────────

  const sendClaim = useCallback(async () => {
    const { reviewResult: review } = stateRef.current
    if (!review?.borrador_reclamo || isSendingClaim) return
    setIsSendingClaim(true)
    try {
      const res = await fetch("/api/send-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa: review.empresa_nombre,
          articulosVulnerados: review.articulos_vulnerados,
          tipoInfraccion: review.tipo_infraccion,
          sancionMaxima: review.sancion_maxima,
          canalRecomendado: review.canal_recomendado,
          borrador: review.borrador_reclamo,
          cmfVerificado: review.cmf_verificado ?? false,
          // recipientEmail omitido — el servidor usa MOCK_BANK_EMAIL
        }),
      })
      if (!res.ok) throw new Error(`send-claim ${res.status}`)
      const { casoId } = await res.json()
      setClaimSentId(casoId)
    } catch (err) {
      console.error("sendClaim error:", err)
    } finally {
      setIsSendingClaim(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSendingClaim])

  // ── Reset ──────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setMessages([])
    setPhase("intake")
    setIsStreaming(false)
    setReviewResult(null)
    setInterviewCount(0)
    greetingSent.current = false
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    // Trigger greeting after reset
    setTimeout(() => {
      triggerAssistant([], "intake")
    }, 100)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    messages,
    phase,
    isStreaming,
    reviewResult,
    sendMessage,
    sendClaim,
    isSendingClaim,
    claimSentId,
    reset,
  }
}
