"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, AlertTriangle, CheckCircle, ChevronRight, ArrowLeft, Loader2, Search } from "lucide-react"
import type { EmpresaPerfil, Sector, Riesgo } from "@/lib/empresas"
import { SECTOR_LABEL, SECTOR_COLOR, RIESGO_COLOR } from "@/lib/empresas"

type EmpresaResult = EmpresaPerfil & { confirmada: boolean; datosExpuestos: number }

type ScanResult = {
  stats: {
    rut: string
    total: number
    confirmadas: number
    alto: number
    totalDatosExpuestos: number
  }
  empresas: EmpresaResult[]
}

export default function DescubrePage() {
  const [rut, setRut] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<ScanResult | null>(null)
  const [filtro, setFiltro] = useState<Sector | "todas">("todas")

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    if (!rut.trim()) return
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const res = await fetch("/api/rut-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rut: rut.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Error desconocido"); return }
      setResult(data)
    } catch {
      setError("No se pudo conectar. Intente de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const empresasFiltradas = result?.empresas.filter(
    (e) => filtro === "todas" || e.sector === filtro,
  ) ?? []

  const sectores = result
    ? (Array.from(new Set(result.empresas.map((e) => e.sector))) as Sector[])
    : []

  // ── Landing ────────────────────────────────────────────────────────────────
  if (!result) {
    return (
      <main className="min-h-svh bg-background flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al asistente
          </Link>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-5 shadow-lg">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              ¿Qué saben de usted?
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ingrese su RUT y le mostramos cuáles de las principales empresas de Chile
              probablemente tienen su información — y cómo recuperarla.
            </p>
          </div>

          <form onSubmit={handleScan} className="space-y-3">
            <div>
              <label htmlFor="rut" className="block text-sm font-medium text-foreground mb-1.5">
                Su RUT
              </label>
              <input
                id="rut"
                type="text"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                placeholder="12.345.678-9"
                className="w-full h-12 rounded-xl border border-border bg-muted/50 px-4 text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-blue-500 focus:bg-card transition-colors"
                autoComplete="off"
                disabled={loading}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Su RUT no se guarda ni se envía a ningún tercero.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2.5">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !rut.trim()}
              className="w-full h-12 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analizando…
                </>
              ) : (
                "Ver mis datos en 2 minutos"
              )}
            </button>
          </form>

          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { n: "21+", label: "empresas analizadas" },
              { n: "Ley 21.719", label: "base legal" },
              { n: "ARCO+P", label: "derechos aplicables" },
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-border bg-muted/30 px-2 py-3">
                <p className="text-sm font-bold text-foreground">{s.n}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  // ── Dashboard ───────────────────────────────────────────────────────────────
  const { stats } = result

  return (
    <main className="min-h-svh bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setResult(null)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Nuevo RUT
        </button>
        <p className="text-xs font-medium text-foreground">{stats.rut}</p>
        <Link
          href="/"
          className="text-xs text-blue-600 font-medium hover:underline"
        >
          Reclamar →
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-xl font-bold text-foreground">{stats.confirmadas}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">empresas con sus datos</p>
          </div>
          <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-3 text-center">
            <p className="text-xl font-bold text-red-600">{stats.alto}</p>
            <p className="text-[10px] text-red-500 mt-0.5">riesgo alto</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3 text-center">
            <p className="text-xl font-bold text-foreground">{stats.totalDatosExpuestos}+</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">datos expuestos</p>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-4 py-3">
          <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
            <strong>Sus derechos:</strong> La Ley 21.719 le permite acceder, corregir, eliminar u oponerse al uso de sus datos en cualquiera de estas empresas. El plazo máximo de respuesta es <strong>30 días</strong>.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFiltro("todas")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filtro === "todas" ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            Todas
          </button>
          {sectores.map((s) => (
            <button
              key={s}
              onClick={() => setFiltro(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filtro === s ? "text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              style={filtro === s ? { backgroundColor: SECTOR_COLOR[s] } : undefined}
            >
              {SECTOR_LABEL[s]}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {empresasFiltradas.map((empresa) => (
            <EmpresaCard key={empresa.id} empresa={empresa} rut={stats.rut} />
          ))}
        </div>
      </div>
    </main>
  )
}

function EmpresaCard({ empresa, rut }: { empresa: EmpresaResult; rut: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-2xl">{empresa.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{empresa.nombre}</p>
            {empresa.cmf && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full px-1.5 py-0.5">
                <CheckCircle className="h-2.5 w-2.5" />
                CMF
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white"
              style={{ backgroundColor: SECTOR_COLOR[empresa.sector] }}
            >
              {SECTOR_LABEL[empresa.sector]}
            </span>
            <span
              className="text-[10px] font-semibold"
              style={{ color: RIESGO_COLOR[empresa.riesgo] }}
            >
              Riesgo {empresa.riesgo}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-bold text-foreground">{empresa.datosExpuestos}</p>
          <p className="text-[10px] text-muted-foreground">datos</p>
        </div>
        <ChevronRight
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border space-y-3">
          {/* Datos que tienen */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Datos que probablemente tienen
            </p>
            <div className="flex flex-wrap gap-1.5">
              {empresa.datos.map((d) => (
                <span
                  key={d}
                  className="text-[11px] bg-muted/60 text-foreground px-2 py-0.5 rounded-full border border-border"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Cómo reclamar */}
          <div className="rounded-lg bg-muted/40 px-3 py-2.5 space-y-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Cómo ejercer sus derechos
            </p>
            <p className="text-xs text-foreground">{empresa.arco.canal}</p>
            <p className="text-[11px] text-muted-foreground">
              Plazo legal: <strong>{empresa.arco.plazo}</strong>
            </p>
            {empresa.arco.notas && (
              <p className="text-[11px] text-blue-600 dark:text-blue-400">{empresa.arco.notas}</p>
            )}
          </div>

          {/* CTA */}
          <Link
            href={`/?empresa=${encodeURIComponent(empresa.nombre)}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 hover:bg-blue-700 transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
            Redactar reclamo a {empresa.nombre}
          </Link>
        </div>
      )}
    </div>
  )
}
