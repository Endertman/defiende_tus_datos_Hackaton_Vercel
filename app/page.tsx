import Link from "next/link"
import { SidePanel } from "@/components/side-panel"

export default function Page() {
  return (
    <main className="min-h-svh w-full bg-background flex items-start justify-end">
      {/* Simulated webpage background to show the panel docked on the right */}
      <div
        aria-hidden="false"
        className="hidden md:flex flex-1 min-h-svh items-center justify-center px-8"
      >
        <div className="max-w-md text-center space-y-5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg">
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground text-balance">
            Defensor de Datos
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
            Su asistente legal para proteger sus datos personales en Chile.
            Basado en la Ley 21.719.
          </p>
          <Link
            href="/descubre"
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 text-white text-sm font-semibold px-6 py-3 hover:bg-blue-700 transition-colors shadow-sm"
          >
            🔍 ¿Qué saben de usted? — Ver mis datos
          </Link>
          <Link
            href="/agente-correos"
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl border border-blue-600 text-blue-700 text-sm font-semibold px-6 py-3 hover:bg-blue-50 transition-colors"
          >
            📧 Abrir Agente de Correos
          </Link>
          <p className="text-xs text-muted-foreground">
            O use el asistente a la derecha para reclamar directamente →
          </p>
        </div>
      </div>

      <SidePanel />
    </main>
  )
}
