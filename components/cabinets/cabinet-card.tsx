"use client"

import type { Cabinet } from "@/lib/types/cabinets"
import { cn } from "@/lib/utils"
import { Lock, LockOpen, Package, Users } from "lucide-react"

interface CabinetCardProps {
  cabinet: Cabinet
  onClick: (cabinet: Cabinet) => void
}

function getZonePalette(location: string | null) {
  const normalized = location?.toUpperCase() ?? ""

  if (normalized.startsWith("A-")) {
    return {
      surfaceClass:
        "bg-linear-to-br from-green-50 via-emerald-50 to-lime-50 text-emerald-950 hover:from-green-100 hover:via-emerald-50 hover:to-lime-100",
      metaClass: "text-emerald-700/70",
    }
  }

  if (
    normalized.startsWith("B-") ||
    normalized.startsWith("C-") ||
    normalized.startsWith("D-")
  ) {
    return {
      surfaceClass:
        "bg-linear-to-br from-sky-50 via-cyan-50 to-blue-50 text-sky-950 hover:from-sky-100 hover:via-cyan-50 hover:to-blue-100",
      metaClass: "text-sky-700/70",
    }
  }

  return {
    surfaceClass:
      "bg-linear-to-br from-gray-50 via-slate-50 to-gray-100 text-slate-900 hover:from-gray-100 hover:via-slate-50 hover:to-gray-100",
    metaClass: "text-slate-400",
  }
}

export function CabinetCard({ cabinet, onClick }: CabinetCardProps) {
  const palette = getZonePalette(cabinet.location)
  const locationLabel =
    cabinet.location === "SIN-UBICACION" ? "S/U" : (cabinet.location ?? "N/A")
  const inventoryCount = cabinet._count?.inventory_items ?? 0
  const activeSessions = cabinet._count?.active_sessions ?? 0
  // Lock HW connectivity: all online for now (ESP32 integration pending)
  const isLockOnline = true
  // Physical door state: set by ESP32 signal via cabinets.is_open
  const isOpen = cabinet.is_open

  return (
    <button
      onClick={() => onClick(cabinet)}
      className={cn(
        "group relative min-h-28 w-full cursor-pointer border-r border-b border-gray-200 p-3.5 text-left transition-all duration-200 ease-out",
        palette.surfaceClass,
        cabinet.status === "locked" && "opacity-50 grayscale-[0.15]",
        "hover:z-10 hover:brightness-[0.97] active:scale-[0.98]",
        "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none focus-visible:ring-inset",
      )}
    >
      <div className="flex h-full flex-col justify-between gap-2">
        {/* Top row: connectivity dot + lock pill */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              isLockOnline ? "animate-pulse bg-emerald-500" : "bg-red-400",
            )}
          />
          {isOpen ? (
            <LockOpen className="h-3.5 w-3.5 text-amber-500" />
          ) : (
            <Lock className={cn("h-3.5 w-3.5", palette.metaClass)} />
          )}
        </div>

        {/* Location code */}
        <div>
          <p className="font-mono text-2xl leading-none font-semibold tracking-[0.16em] text-current uppercase sm:text-2xl">
            {locationLabel}
          </p>
          {cabinet.location === "SIN-UBICACION" && (
            <p className="mt-1 text-[10px] leading-4 text-slate-400">
              Pendiente por ubicar
            </p>
          )}
        </div>

        {/* Bottom meta */}
        <div
          className={cn(
            "flex items-center gap-3 text-[11px]",
            palette.metaClass,
          )}
        >
          <span className="flex items-center gap-1.5">
            <Package className="h-3 w-3" />
            {inventoryCount} artículo{inventoryCount !== 1 ? "s" : ""}
          </span>
          {activeSessions > 0 && (
            <span className="flex items-center gap-1.5 font-medium text-amber-600">
              <Users className="h-3 w-3" />
              {activeSessions} activo{activeSessions !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
