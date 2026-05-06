"use client"

import { useState, useCallback } from "react"
import { Send, Copy, Check, Mail, Loader2 } from "lucide-react"

type InputAreaProps = {
  showCopyButton: boolean
  showSendButton: boolean
  disabled: boolean
  onSend: (text: string) => void
  onSendClaim: () => Promise<void>
  borradorReclamo: string | null
  isSendingClaim: boolean
  claimSentId: string | null
}

export function InputArea({
  showCopyButton,
  showSendButton,
  disabled,
  onSend,
  onSendClaim,
  borradorReclamo,
  isSendingClaim,
  claimSentId,
}: InputAreaProps) {
  const [text, setText] = useState("")
  const [copied, setCopied] = useState(false)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = text.trim()
      if (!trimmed || disabled) return
      onSend(trimmed)
      setText("")
    },
    [text, disabled, onSend],
  )

  const handleCopy = useCallback(async () => {
    if (!borradorReclamo) return
    try {
      await navigator.clipboard.writeText(borradorReclamo)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = borradorReclamo
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [borradorReclamo])

  return (
    <div className="border-t border-border bg-card px-3 pt-3 pb-3">

      {/* Botón principal: enviar carta al banco */}
      {showSendButton && !claimSentId && (
        <button
          type="button"
          onClick={onSendClaim}
          disabled={isSendingClaim}
          className="mb-2.5 w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#1e40af" }}
        >
          {isSendingClaim ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Enviando carta…
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" aria-hidden="true" />
              Enviar carta al banco ahora
            </>
          )}
        </button>
      )}

      {/* Confirmación de envío */}
      {claimSentId && (
        <div className="mb-2.5 w-full rounded-lg px-3 py-2.5 text-[12px] font-medium text-white text-center" style={{ backgroundColor: "#059669" }}>
          <Check className="inline h-4 w-4 mr-1" aria-hidden="true" />
          ¡Carta enviada! N° {claimSentId.slice(0, 8)}… · Plazo: 30 días
        </div>
      )}

      {/* Botón copiar (secundario) */}
      {showCopyButton && !claimSentId && (
        <button
          type="button"
          onClick={handleCopy}
          className="mb-2.5 w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold shadow-sm transition-all hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] border border-border text-foreground bg-muted/50"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              ¡Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copiar carta
            </>
          )}
        </button>
      )}

      <form
        className="flex items-end gap-2"
        onSubmit={handleSubmit}
        aria-label="Enviar mensaje"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escriba aquí…"
            disabled={disabled}
            aria-label="Mensaje"
            className="w-full h-10 rounded-lg border border-border bg-muted/50 pl-3 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/80 outline-none transition-colors focus:bg-card focus:border-ring/60 disabled:cursor-not-allowed disabled:opacity-70"
          />
        </div>

        <button
          type="submit"
          disabled={disabled || !text.trim()}
          aria-label="Enviar"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: "#6366f1" }}
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      {disabled && (
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          El asistente está respondiendo…
        </p>
      )}
    </div>
  )
}
