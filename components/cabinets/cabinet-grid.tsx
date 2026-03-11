"use client"

import { useCabinets } from "@/hooks/use-cabinets"
import type { Cabinet } from "@/lib/types/cabinets"
import { cn } from "@/lib/utils"
import { Wifi, WifiOff } from "lucide-react"
import { useState } from "react"
import { CabinetCard } from "./cabinet-card"
import { CabinetDetail } from "./cabinet-detail"

interface CabinetGridProps {
  initialCabinets: Cabinet[]
  userId: string
}

export function CabinetGrid({ initialCabinets, userId }: CabinetGridProps) {
  const { cabinets, isConnected } = useCabinets(initialCabinets)
  // Store only the ID so the drawer always receives the *live* cabinet from the
  // realtime-updated cabinets array — not a stale snapshot from click time.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Derive the current live cabinet on every render
  const selectedCabinet = selectedId
    ? (cabinets.find((c) => c.id === selectedId) ?? null)
    : null

  function handleCardClick(cabinet: Cabinet) {
    setSelectedId(cabinet.id)
    setDrawerOpen(true)
  }

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

      {/* Grid */}
      <div className="grid grid-cols-2 rounded border-t border-l border-gray-200 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {cabinets.map((cabinet) => (
          <CabinetCard
            key={cabinet.id}
            cabinet={cabinet}
            onClick={handleCardClick}
          />
        ))}
      </div>

      <CabinetDetail
        cabinet={selectedCabinet}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        userId={userId}
      />
    </>
  )
}
