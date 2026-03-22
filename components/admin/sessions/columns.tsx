"use client"

import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatDistance } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { Archive, Clock, User } from "lucide-react"

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
      <Badge variant="outline">
        <Archive className="size-2" />
        {row.getValue("cabinet_name") || "Sin gabinete"}
      </Badge>
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
          <span className="text-sm">{formatDate(date, "d MMM yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(date, "h:mm a")}
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
          <span className="text-sm">{formatDate(date, "d MMM yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(date, "h:mm a")}
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
          {formatDistance(openedAt, closedAt)}
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
      return <Badge variant="outline">{count || 0}</Badge>
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
