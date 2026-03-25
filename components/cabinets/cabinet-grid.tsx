"use client"

import { Input } from "@/components/ui/input"
import { useCabinets } from "@/hooks/use-cabinets"
import type { Cabinet, CabinetStatus } from "@/lib/types/cabinets"
import { cn } from "@/lib/utils"
import { Search, Wifi, WifiOff, X } from "lucide-react"
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
  const { cabinets, isConnected } = useCabinets(initialCabinets)
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
      {/* Connection indicator */}
      <div
        className={cn(
          "fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-all duration-500",
          isConnected
            ? "border-primary/20 bg-primary/5 text-primary dark:border-primary/40 dark:bg-primary/10"
            : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400",
        )}
      >
        {isConnected ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {isConnected ? "En vivo" : "Sin conexión"}
      </div>

      {/* Toolbar */}
      <div className="px-4 pb-4 sm:px-6">
        <div className="mx-auto w-full max-w-xl">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-200/40 via-cyan-200/35 to-emerald-200/40 blur-sm dark:from-sky-800/30 dark:via-cyan-800/20 dark:to-emerald-800/30" />
            <div className="relative rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur dark:border-gray-700/70 dark:bg-gray-900/70">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Buscar por gabinete u objetos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 border-0 bg-transparent pr-28 pl-9 text-sm shadow-none focus-visible:ring-0"
              />

              {hasQuery && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute top-1/2 right-2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <X className="h-3 w-3" />
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <p className="mt-2 px-1 text-xs text-gray-500 dark:text-gray-400">
            {hasQuery
              ? `${filteredWithMatches.length} resultado${filteredWithMatches.length === 1 ? "" : "s"}`
              : `${cabinets.length} gabinete${cabinets.length === 1 ? "" : "s"} disponibles`}
          </p>
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
        <div className="mt-8 grid grid-cols-2 rounded border-t border-l border-gray-200 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 dark:border-gray-800">
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
