import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Cabinet } from "@/lib/types/cabinets"

import { Archive, Users } from "lucide-react"

export function CabinetDetailHeader({ cabinet }: { cabinet: Cabinet }) {
  return (
    <DrawerHeader className="shrink-0 border-b border-border px-5 pt-4 pb-3 text-left">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <DrawerTitle className="text-base leading-tight font-semibold text-foreground">
            {cabinet.name}
          </DrawerTitle>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Archive className="h-3.5 w-3.5" />
          <span>{cabinet._count.inventory_items} artículos</span>
        </div>
        {cabinet._count.active_sessions > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600">
            <Users className="h-3.5 w-3.5" />
            <span>
              {cabinet._count.active_sessions} sesión
              {cabinet._count.active_sessions !== 1 ? "es activas" : " activa"}
            </span>
          </div>
        )}
      </div>
    </DrawerHeader>
  )
}
