"use client"

import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { HistorySession } from "@/lib/types/cabinets"
import { es, formatDate, formatDistance } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { Archive, Box, ClipboardClock, Clock, Lock, Unlock } from "lucide-react"

export type { HistorySession }

export const sessionHistoryColumns = (
  onViewTimeline?: (session: HistorySession) => void,
): ColumnDef<HistorySession>[] => [
  {
    accessorKey: "cabinet_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gabinete" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Archive className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("cabinet_name")}</span>
        </div>
      )
    },
    enableHiding: false,
    // @ts-expect-error - filterFn personalizado
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
          <Unlock className="size-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">
              {formatDate(date, "d MMM yyyy")}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(date, "h:mm a")}
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
          <Badge className="gap-1 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Clock className="size-3" />
            En curso
          </Badge>
        )
      }

      const date = new Date(closedAt)
      return (
        <div className="flex items-center gap-2">
          <Lock className="size-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">
              {formatDate(date, "d MMM yyyy")}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(date, "h:mm a")}
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

      return (
        <div className="text-sm text-muted-foreground normal-case">
          {duration}
        </div>
      )
    },
  },
  {
    id: "Articulo",
    header: "Articulos",
    cell: ({ row }) => {
      const items = row.original.items
      if (!items || items.length === 0) {
        return <span className="text-sm text-muted-foreground">—</span>
      }

      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            <Box className="size-3" />
            {items.length}
          </Badge>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onViewTimeline?.(row.original)}
      >
        <ClipboardClock className="size-4" />
        Detalles
      </Button>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]
