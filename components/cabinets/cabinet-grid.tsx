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

function normalizeForSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

export function CabinetGrid({ initialCabinets, userId }: CabinetGridProps) {
  const { cabinets } = useCabinets(initialCabinets, userId)
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

  const q = normalizeForSearch(search)
  const hasQuery = q.length > 0

  const filteredWithMatches = React.useMemo(() => {
    return cabinets
      .filter((c) => {
        const normalizedName = normalizeForSearch(c.name)
        const normalizedLocation = normalizeForSearch(c.location ?? "")
        const matchSearch =
          !q ||
          normalizedName.includes(q) ||
          normalizedLocation.includes(q) ||
          c.item_names.some((n) => normalizeForSearch(n).includes(q))
        const matchStatus = statusFilter === "all" || c.status === statusFilter
        return matchSearch && matchStatus
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((cabinet) => ({
        cabinet,
        matchedItems: q
          ? [
              ...new Set(
                cabinet.item_names.filter((n) =>
                  normalizeForSearch(n).includes(q),
                ),
              ),
            ]
          : undefined,
      }))
  }, [cabinets, q, statusFilter])

  const myCabinets = React.useMemo(
    () =>
      filteredWithMatches.filter(
        ({ cabinet }) => cabinet._count.my_active_sessions > 0,
      ),
    [filteredWithMatches],
  )

  const otherCabinets = React.useMemo(
    () =>
      filteredWithMatches.filter(
        ({ cabinet }) => cabinet._count.my_active_sessions === 0,
      ),
    [filteredWithMatches],
  )

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
        </div>{" "}
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
        <div className="mt-8 space-y-8 p-2 md:mt-12">
          {myCabinets.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold">
                  Gabinetes que estas usando
                </h2>
                <span className="text-xs text-muted-foreground">
                  {myCabinets.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {myCabinets.map(({ cabinet, matchedItems }) => (
                  <CabinetCard
                    key={cabinet.id}
                    cabinet={cabinet}
                    onClick={handleCardClick}
                    matchedItems={matchedItems}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            {myCabinets.length > 0 && (
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-foreground">
                  Resto de gabinetes
                </h2>
                <span className="text-xs text-muted-foreground">
                  {otherCabinets.length}
                </span>
              </div>
            )}

            {otherCabinets.length === 0 ? (
              <div className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                No hay otros gabinetes con ese criterio.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {otherCabinets.map(({ cabinet, matchedItems }) => (
                  <CabinetCard
                    key={cabinet.id}
                    cabinet={cabinet}
                    onClick={handleCardClick}
                    matchedItems={matchedItems}
                  />
                ))}
              </div>
            )}
          </section>
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
