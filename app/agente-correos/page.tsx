"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { EmailListResponse, EmailStatus, TrackedEmail } from "@/lib/email-agent-types"

type Filter = "todos" | EmailStatus

export default function AgenteCorreosPage() {
  const [recipientEmail, setRecipientEmail] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [subject, setSubject] = useState("")
  const [context, setContext] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<EmailListResponse | null>(null)
  const [filter, setFilter] = useState<Filter>("todos")

  async function fetchEmails() {
    const q = filter === "todos" ? "" : `?status=${filter}`
    const res = await fetch(`/api/agente-correos/emails${q}`, { cache: "no-store" })
    const json = (await res.json()) as EmailListResponse
    setData(json)
  }

  useEffect(() => {
    fetchEmails().catch(() => {})
  }, [filter])

  const canSubmit = useMemo(
    () => recipientEmail.trim() && subject.trim() && context.trim(),
    [recipientEmail, subject, context],
  )

  async function onCreate() {
    if (!canSubmit) return
    setLoading(true)
    try {
      await fetch("/api/agente-correos/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: recipientEmail.trim(),
          recipientName: recipientName.trim(),
          subject: subject.trim(),
          context: context.trim(),
        }),
      })
      setRecipientEmail("")
      setRecipientName("")
      setSubject("")
      setContext("")
      await fetchEmails()
    } finally {
      setLoading(false)
    }
  }

  async function postAction(url: string, method = "POST") {
    await fetch(url, { method })
    await fetchEmails()
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-lg border p-4">
        <h1 className="text-xl font-semibold">Agente de Correos</h1>
        <p className="text-sm text-muted-foreground">Redacción con IA + seguimiento con aprobación humana.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input placeholder="Destinatario (email)" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
          <Input placeholder="Nombre (opcional)" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
          <Input className="md:col-span-2" placeholder="Asunto" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea className="md:col-span-2" rows={4} placeholder="Contexto y objetivo del correo" value={context} onChange={(e) => setContext(e.target.value)} />
          <div className="md:col-span-2">
            <Button onClick={onCreate} disabled={!canSubmit || loading}>
              {loading ? "Enviando..." : "Redactar y enviar"}
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex gap-2">
          {(["todos", "esperando_respuesta", "esperando_aprobacion", "aprobado", "respondido"] as Filter[]).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
              {f}
            </Button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-2">Destinatario</th>
                <th className="p-2">Asunto</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items || []).map((email: TrackedEmail) => (
                <tr key={email.id} className="border-t">
                  <td className="p-2">{email.recipientEmail}</td>
                  <td className="p-2">{email.subject}</td>
                  <td className="p-2">{email.status}</td>
                  <td className="p-2 space-x-2">
                    {email.status === "esperando_aprobacion" && (
                      <Button size="sm" onClick={() => postAction(`/api/agente-correos/approve-followup?id=${email.id}`, "GET")}>
                        Aprobar follow-up
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => postAction(`/api/agente-correos/emails/${email.id}/mark-replied`)}>
                      Marcar respondido
                    </Button>
                    {email.status === "esperando_aprobacion" && (
                      <Button size="sm" variant="outline" onClick={() => postAction(`/api/agente-correos/emails/${email.id}/followup`, "DELETE")}>
                        Rechazar follow-up
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
