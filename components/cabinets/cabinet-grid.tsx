"use client"

import { Input } from "@/components/ui/input"
import { useCabinets } from "@/hooks/use-cabinets"
import type { Cabinet, CabinetStatus } from "@/lib/types/cabinets"
import { cn } from "@/lib/utils"
import { Wifi, WifiOff } from "lucide-react"
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
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")

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
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
            <span className="text-3xl">🗄️</span>
          </div>
          <p className="text-sm text-gray-500">No hay gabinetes registrados.</p>
          <p className="mt-1 text-xs text-gray-400">
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
            ? "border-primary/20 bg-primary/5 text-primary"
            : "border-red-200 bg-red-50 text-red-700",
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
      <div className="flex flex-col gap-2 px-4 pb-4 sm:px-6">
        <Input
          placeholder="Buscar por gabinete, ubicación o artículo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  statusFilter === f.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-gray-100",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {filteredWithMatches.length} de {cabinets.length}
          </span>
        </div>
      </div>

      {/* Grid */}
      {filteredWithMatches.length === 0 ? (
        <div className="px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-gray-500">
              Sin gabinetes con ese criterio.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 rounded border-t border-l border-gray-200 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
