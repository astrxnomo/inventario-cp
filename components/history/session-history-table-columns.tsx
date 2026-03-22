"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { format, formatDistance } from "date-fns"
import { es } from "date-fns/locale"
import {
  ClockIcon,
  DoorOpenIcon,
  DoorClosedIcon,
  PackageIcon,
} from "lucide-react"
import type { HistorySession } from "@/lib/types/cabinets"

export type { HistorySession }

export const sessionHistoryColumns: ColumnDef<HistorySession>[] = [
  {
    accessorKey: "cabinet_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gabinete" />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-medium">{row.getValue("cabinet_name") || "—"}</div>
      )
    },
    enableHiding: false,
    // @ts-ignore - filterFn personalizado
    filterFn: "fuzzy",
  },
  {
    accessorKey: "opened_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Apertura" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("opened_at"))
      return (
        <div className="flex items-center gap-2">
          <DoorOpenIcon className="size-4 text-green-600" />
          <div>
            <div className="text-sm font-medium">
              {format(date, "d MMM yyyy", { locale: es })}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(date, "HH:mm", { locale: es })}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "closed_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cierre" />
    ),
    cell: ({ row }) => {
      const closedAt = row.getValue("closed_at") as string | null

      if (!closedAt) {
        return (
          <Badge variant="secondary" className="gap-1">
            <ClockIcon className="size-3" />
            En curso
          </Badge>
        )
      }

      const date = new Date(closedAt)
      return (
        <div className="flex items-center gap-2">
          <DoorClosedIcon className="size-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">
              {format(date, "d MMM yyyy", { locale: es })}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(date, "HH:mm", { locale: es })}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    id: "duration",
    header: "Duración",
    cell: ({ row }) => {
      const openedAt = new Date(row.getValue("opened_at"))
      const closedAt = row.getValue("closed_at") as string | null

      if (!closedAt) {
        return <span className="text-sm text-muted-foreground">—</span>
      }

      const duration = formatDistance(openedAt, new Date(closedAt), {
        locale: es,
      })

      return <div className="text-sm">{duration}</div>
    },
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.items
      if (!items || items.length === 0) {
        return <span className="text-sm text-muted-foreground">—</span>
      }

      return (
        <div className="flex items-center gap-2">
          <PackageIcon className="size-4 text-muted-foreground" />
          <Badge variant="secondary" className="font-mono">
            {items.length}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "notes",
    header: "Notas",
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string | null
      return (
        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
          {notes || "—"}
        </div>
      )
    },
  },
]
