"use client"

import { Input } from "@/components/ui/input"
import { useCabinets } from "@/hooks/use-cabinets"
import type { Cabinet, CabinetStatus } from "@/lib/types/cabinets"

import { Search, X } from "lucide-react"
import * as React from "react"
import { CabinetCard } from "./cabinet-card"
import { CabinetDetail } from "./cabinet-detail"

interface CabinetGridProps {
  initialCabinets: Cabinet[]
  userId: string
}

type StatusFilter = "all" | CabinetStatus

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "available", label: "Disponibles" },
  { id: "in_use", label: "En uso" },
  { id: "locked", label: "Bloqueados" },
]

export function CabinetGrid({ initialCabinets, userId }: CabinetGridProps) {
  const { cabinets } = useCabinets(initialCabinets)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [statusFilter] = React.useState<StatusFilter>("all")

  const selectedCabinet = React.useMemo(
    () =>
      selectedId ? (cabinets.find((c) => c.id === selectedId) ?? null) : null,
    [cabinets, selectedId],
  )

  function handleCardClick(cabinet: Cabinet) {
    setSelectedId(cabinet.id)
    setDrawerOpen(true)
  }

  const q = search.toLowerCase().trim()
  const hasQuery = q.length > 0

  const filteredWithMatches = React.useMemo(() => {
    return cabinets
      .filter((c) => {
        const matchSearch =
          !q ||
          c.name.toLowerCase().includes(q) ||
          (c.location ?? "").toLowerCase().includes(q) ||
          c.item_names.some((n) => n.toLowerCase().includes(q))
        const matchStatus = statusFilter === "all" || c.status === statusFilter
        return matchSearch && matchStatus
      })
      .map((cabinet) => ({
        cabinet,
        matchedItems: q
          ? [
              ...new Set(
                cabinet.item_names.filter((n) => n.toLowerCase().includes(q)),
              ),
            ]
          : undefined,
      }))
  }, [cabinets, q, statusFilter])

  if (cabinets.length === 0) {
    return (
      <div className="px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            <span className="text-3xl">🗄️</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay gabinetes registrados.
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Pide a un administrador que agregue gabinetes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-10 pb-4 sm:px-6">
        <div className="mx-auto w-full max-w-xl">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-primary/15 blur-lg" />
            <div className="relative rounded-2xl border border-border bg-card shadow-sm backdrop-blur">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Buscar por gabinete o articulos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 border-0 bg-transparent pr-28 pl-9 text-sm shadow-none focus-visible:ring-0"
              />

              {hasQuery && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="borde absolute top-1/2 right-2 inline-flex -translate-y-1/2 items-center gap-1 rounded-xl bg-accent px-2 py-1 text-[11px] font-medium text-accent-foreground hover:bg-accent/80"
                >
                  <X className="h-3 w-3" />
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredWithMatches.length === 0 ? (
        <div className="px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sin gabinetes con ese criterio.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 md:mt-12 lg:grid-cols-4 xl:grid-cols-5">
          {filteredWithMatches.map(({ cabinet, matchedItems }) => {
            return (
              <CabinetCard
                key={cabinet.id}
                cabinet={cabinet}
                onClick={handleCardClick}
                matchedItems={matchedItems}
              />
            )
          })}
        </div>
      )}

      <CabinetDetail
        cabinet={selectedCabinet}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        userId={userId}
      />
    </>
  )
}
