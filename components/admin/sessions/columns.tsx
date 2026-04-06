"use client"

import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { es, formatDate, formatDistance } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import {
  Archive,
  Box,
  ClipboardClock,
  Clock,
  Lock,
  Unlock,
  User,
} from "lucide-react"

export type SessionItem = {
  id: string
  item_id: string
  name: string
  category?: string
  added_at: string
  action: "withdrawn" | "returned"
  quantity: number
}

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
  items?: SessionItem[]
}

export const sessionStatusOptions = [
  { label: "Activa", value: "active", icon: Clock },
  { label: "Completada", value: "completed", icon: Clock },
]

export const adminSessionColumns = (
  onViewItems?: (session: AdminSession) => void,
): ColumnDef<AdminSession>[] => [
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
            <Clock className="size-4" />
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
      <DataTableColumnHeader column={column} title="Articulo" />
    ),
    cell: ({ row }) => {
      const count = row.getValue("items_count") as number
      return (
        <Badge variant="outline">
          <Box className="size-4" />
          {count || 0}
        </Badge>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acciones" />
    ),
    cell: ({ row }) => {
      return (
        <Button
          variant="outline"
          onClick={() => onViewItems?.(row.original)}
          className="cursor-pointer"
        >
          <ClipboardClock />
          Detalles
        </Button>
      )
    },
    enableSorting: false,
  },
]
