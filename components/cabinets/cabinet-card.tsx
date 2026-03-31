"use client"

import type { Cabinet } from "@/lib/types/cabinets"
import { cn } from "@/lib/utils"
import { Archive, Lock, LockOpen, Users } from "lucide-react"

interface CabinetCardProps {
  cabinet: Cabinet
  onClick: (cabinet: Cabinet) => void
  matchedItems?: string[]
}

function getZonePalette(location: string | null) {
  const normalized = location?.toUpperCase() ?? ""

  if (normalized.startsWith("A-")) {
    return {
      surfaceClass:
        "bg-linear-to-br from-green-50 via-emerald-50 to-emerald-50 text-emerald-950 hover:from-green-100 hover:via-emerald-50 hover:to-emerald-100 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-emerald-950/30 dark:text-emerald-400 dark:hover:from-green-900/40 dark:hover:via-emerald-900/40 dark:hover:to-emerald-900/40",
      metaClass: "text-emerald-700/70 dark:text-emerald-400/70",
      chipClass:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
    }
  }

  if (
    normalized.startsWith("B-") ||
    normalized.startsWith("C-") ||
    normalized.startsWith("D-")
  ) {
    return {
      surfaceClass:
        "bg-linear-to-br from-sky-50 via-cyan-50 to-blue-50 text-sky-950 hover:from-sky-100 hover:via-cyan-50 hover:to-blue-100 dark:from-sky-950/30 dark:via-cyan-950/30 dark:to-blue-950/30 dark:text-sky-400 dark:hover:from-sky-900/40 dark:hover:via-cyan-900/40 dark:hover:to-blue-900/40",
      metaClass: "text-sky-700/70 dark:text-sky-400/70",
      chipClass: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-400",
    }
  }

  return {
    surfaceClass:
      "bg-linear-to-br from-gray-50 via-gray-50 to-gray-100 text-slate-900 hover:from-gray-100 hover:via-gray-50 hover:to-gray-100 dark:from-gray-700/40 dark:via-gray-900/40 dark:to-gray-800/40 dark:text-gray-200 dark:hover:from-gray-800/50 dark:hover:via-gray-800/50 dark:hover:to-gray-700/50",
    metaClass: "text-gray-400 dark:text-slate-500",
    chipClass:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  }
}

export function CabinetCard({
  cabinet,
  onClick,
  matchedItems,
}: CabinetCardProps) {
  const palette = getZonePalette(cabinet.location)
  const locationLabel =
    cabinet.location === "SIN-UBICACION" ? "S/U" : (cabinet.location ?? "—")
  const inventoryCount = cabinet._count?.inventory_items ?? 0
  const activeSessions = cabinet._count?.active_sessions ?? 0
  const isLockOnline = true
  const isOpen = cabinet.is_open

  return (
    <button
      onClick={() => onClick(cabinet)}
      className={cn(
        "group relative w-full cursor-pointer rounded-xl p-3 text-left transition-all duration-200 ease-out",
        palette.surfaceClass,
        cabinet.status === "locked" && "opacity-50 grayscale-[0.15]",
        "hover:z-10 hover:brightness-[0.97] active:scale-[0.98] dark:hover:brightness-110",
        "focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none focus-visible:ring-inset",
      )}
    >
      <div className="flex h-full flex-col justify-between gap-2">
        {/* Top row: connectivity dot + lock icon */}
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
        </div>

        {/* Bottom meta */}
        <div className="space-y-1.5">
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]",
              palette.metaClass,
            )}
          >
            <span className="flex items-center gap-1">
              <Archive className="h-3 w-3" />
              {inventoryCount} articulo{inventoryCount !== 1 ? "s" : ""}
            </span>
            {activeSessions > 0 && (
              <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                <Users className="h-3 w-3" />
                {activeSessions} sesión{activeSessions !== 1 ? "es" : ""} activa
                {activeSessions !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Matched items chips */}
          {matchedItems && matchedItems.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {matchedItems.slice(0, 3).map((name) => (
                <span
                  key={name}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] leading-tight font-medium",
                    palette.chipClass,
                  )}
                >
                  {name}
                </span>
              ))}
              {matchedItems.length > 3 && (
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] leading-tight font-medium",
                    palette.chipClass,
                  )}
                >
                  +{matchedItems.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
