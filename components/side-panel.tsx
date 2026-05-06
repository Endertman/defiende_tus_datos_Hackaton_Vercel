"use client"

import { PanelHeader } from "@/components/panel-header"
import { ChatArea } from "@/components/chat-area"
import { InputArea } from "@/components/input-area"
import { useLegalChat } from "@/hooks/use-legal-chat"
import type { Phase } from "@/lib/phases"

const PHASE_STEP: Record<Phase, number> = {
  intake: 1,
  canal: 2,
  entrevista: 3,
  revisando: 4,
  entrega: 4,
}

export function SidePanel() {
  const {
    messages, phase, isStreaming, reviewResult,
    sendMessage, sendClaim, isSendingClaim, claimSentId, reset,
  } = useLegalChat()

  const currentStep = PHASE_STEP[phase]
  const isEntrega = phase === "entrega" && !!reviewResult?.borrador_reclamo
  const showCopyButton = isEntrega
  const showSendButton = isEntrega && !claimSentId
  const inputDisabled = isStreaming || phase === "revisando"

  return (
    <aside
      aria-label="Defensor de Datos side panel"
      className="flex flex-col h-svh w-full md:w-[380px] md:shrink-0 bg-card shadow-[-1px_0_0_0_rgba(15,23,42,0.06),-8px_0_24px_-12px_rgba(15,23,42,0.12)] border-l border-border"
    >
      <PanelHeader
        phase={phase}
        currentStep={currentStep}
        onReset={reset}
      />
      <ChatArea
        phase={phase}
        messages={messages}
        isStreaming={isStreaming}
      />
      <InputArea
        showCopyButton={showCopyButton}
        showSendButton={showSendButton}
        disabled={inputDisabled}
        onSend={sendMessage}
        onSendClaim={sendClaim}
        borradorReclamo={reviewResult?.borrador_reclamo ?? null}
        isSendingClaim={isSendingClaim}
        claimSentId={claimSentId}
      />
    </aside>
  )
}
