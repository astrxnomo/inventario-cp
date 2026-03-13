"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Input } from "@/components/ui/input"
import type { HistorySession } from "@/lib/types/cabinets"
import { Calendar, Package } from "lucide-react"
import * as React from "react"

const PAGE_SIZE = 8

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function SessionCard({ session }: { session: HistorySession }) {
  const withdrawn = session.items.filter((i) => i.action === "withdrawn")
  const returned = session.items.filter((i) => i.action === "returned")

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">
              {session.cabinet_name}
            </span>
            {session.closed_at ? (
              <Badge variant="secondary">Cerrada</Badge>
            ) : (
              <Badge>Activa</Badge>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(session.opened_at)}</span>
            {session.closed_at && (
              <>
                <span>→</span>
                <span>{formatDate(session.closed_at)}</span>
              </>
            )}
          </div>
          {session.notes && (
            <p className="mt-1 text-xs text-muted-foreground italic">
              {session.notes}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          {withdrawn.length} artículo{withdrawn.length !== 1 ? "s" : ""}
        </div>
      </div>

      {session.items.length > 0 && (
        <div className="mt-4 space-y-1 border-t border-gray-100 pt-3">
          {withdrawn.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Retirados
              </p>
              <ul className="space-y-0.5">
                {withdrawn.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">
                      ×{item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {returned.length > 0 && (
            <div className="mt-2">
              <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Devueltos
              </p>
              <ul className="space-y-0.5">
                {returned.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">
                      ×{item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function SessionHistory({ sessions }: { sessions: HistorySession[] }) {
  const [search, setSearch] = React.useState("")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [page, setPage] = React.useState(0)

  const q = search.toLowerCase()
  const filtered = sessions.filter((s) => {
    const matchSearch =
      !q ||
      s.cabinet_name.toLowerCase().includes(q) ||
      s.items.some((i) => i.name.toLowerCase().includes(q))
    const d = s.opened_at.slice(0, 10)
    const matchFrom = !dateFrom || d >= dateFrom
    const matchTo = !dateTo || d <= dateTo
    return matchSearch && matchFrom && matchTo
  })

  React.useEffect(() => {
    setPage(0)
  }, [search, dateFrom, dateTo])

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
        <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm text-muted-foreground">
          No tienes sesiones registradas aún.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex flex-col gap-2">
        <Input
          placeholder="Buscar por gabinete o artículo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onChange={(f, t) => {
              setDateFrom(f)
              setDateTo(t)
            }}
          />
          <span className="ml-auto text-sm text-muted-foreground">
            {filtered.length} sesión{filtered.length !== 1 ? "es" : ""}
          </span>
        </div>
      </div>

      {/* cards */}
      {paged.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-sm text-muted-foreground">
          Sin resultados para los filtros aplicados.
        </div>
      ) : (
        <div className="space-y-3">
          {paged.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}

      {/* pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Página {page + 1} de {pageCount} · {page * PAGE_SIZE + 1}–
            {page * PAGE_SIZE + paged.length} de {filtered.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pageCount - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
