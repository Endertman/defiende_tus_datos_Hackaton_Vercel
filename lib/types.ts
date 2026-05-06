export interface Caso {
  id: string
  phone?: string
  userEmail?: string
  userName?: string
  empresa: string
  articulosVulnerados: string[]
  tipoInfraccion: "leve" | "grave" | "gravisima"
  sancionMaxima: string
  canalRecomendado: "empresa_directa" | "agencia" | "tribunal"
  borrador: string
  cmfVerificado: boolean
  status: "pendiente" | "enviado" | "respondido" | "vencido"
  sentAt: string
  dueDate: string
  updatedAt: string
}

export interface WhatsAppSession {
  phone: string
  fase: "intake" | "canal" | "entrevista" | "revisando" | "entrega"
  messages: Array<{ role: "user" | "assistant"; content: string }>
  claim?: {
    empresa: string
    articulosVulnerados: string[]
    tipoInfraccion: "leve" | "grave" | "gravisima"
    sancionMaxima: string
    canalRecomendado: "empresa_directa" | "agencia" | "tribunal"
    borrador: string
    cmfVerificado: boolean
  }
  casoId?: string
  updatedAt: string
}
