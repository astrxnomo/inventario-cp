"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { format, formatDistance } from "date-fns"
import { es } from "date-fns/locale"
import { Package, User, Clock } from "lucide-react"

export type AdminSession = {
  id: string
  user_id: string
  cabinet_id: string
  opened_at: string
  closed_at: string | null
  notes: string | null
  // Joins
  user_name?: string
  cabinet_name?: string
  items_count?: number
}

export const sessionStatusOptions = [
  { label: "Activa", value: "active", icon: Clock },
  { label: "Completada", value: "completed", icon: Clock },
]

export const adminSessionColumns: ColumnDef<AdminSession>[] = [
  {
    accessorKey: "user_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Usuario" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="size-4 text-muted-foreground" />
        <span className="font-medium">
          {row.getValue("user_name") || "Sin nombre"}
        </span>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "cabinet_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gabinete" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Package className="size-4 text-muted-foreground" />
        <span>{row.getValue("cabinet_name")}</span>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "opened_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Apertura" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("opened_at"))
      return (
        <div className="flex flex-col">
          <span className="text-sm">
            {format(date, "d MMM yyyy", { locale: es })}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(date, "HH:mm", { locale: es })}
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false,
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
          <Badge
            variant="outline"
            className="border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400"
          >
            <Clock className="mr-1 size-3" />
            En curso
          </Badge>
        )
      }
      const date = new Date(closedAt)
      return (
        <div className="flex flex-col">
          <span className="text-sm">
            {format(date, "d MMM yyyy", { locale: es })}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(date, "HH:mm", { locale: es })}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: "duration",
    accessorKey: "opened_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duración" />
    ),
    cell: ({ row }) => {
      const openedAt = new Date(row.getValue("opened_at"))
      const closedAt = row.original.closed_at
        ? new Date(row.original.closed_at)
        : new Date()

      return (
        <span className="text-sm text-muted-foreground">
          {formatDistance(openedAt, closedAt, { locale: es })}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "items_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Items" />
    ),
    cell: ({ row }) => {
      const count = row.getValue("items_count") as number
      return <span className="text-sm font-medium">{count || 0}</span>
    },
    enableSorting: true,
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notas" />
    ),
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string | null
      return (
        <span className="line-clamp-1 text-sm text-muted-foreground">
          {notes || "-"}
        </span>
      )
    },
    enableSorting: false,
  },
]
