"use client"

import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { formatDate, isFuture, isPast } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { AlertCircle, Box, Calendar, Check, Clock, User, X } from "lucide-react"

export type AdminReservation = {
  id: string
  user_id: string
  item_id: string
  cabinet_id: string
  quantity: number
  starts_at: string
  ends_at: string
  status: "active" | "completed" | "cancelled" | "expired"
  notes: string | null
  // Joins
  user_name?: string
  item_name?: string
  cabinet_name?: string
  category_name?: string
}

export const reservationStatusOptions = [
  { label: "Activa", value: "active", icon: Calendar },
  { label: "Completada", value: "completed", icon: Calendar },
  { label: "Cancelada", value: "cancelled", icon: AlertCircle },
  { label: "Expirada", value: "expired", icon: AlertCircle },
]

const statusColors = {
  active:
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  completed:
    "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  cancelled: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  expired:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
}

const statusLabels = {
  active: "Activa",
  completed: "Completada",
  cancelled: "Cancelada",
  expired: "Expirada",
}

export const adminReservationColumns: ColumnDef<AdminReservation>[] = [
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
    accessorKey: "item_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Articulo" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Box className="size-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("item_name")}</span>
        </div>
        {row.original.category_name && (
          <span className="pl-6 text-xs text-muted-foreground">
            {row.original.category_name}
          </span>
        )}
      </div>
    ),
    enableSorting: true,
  },

  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("quantity")}</Badge>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "starts_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Inicio" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("starts_at"))
      const isUpcoming = isFuture(date)
      return (
        <div className="flex flex-col">
          <span
            className={`text-sm ${isUpcoming ? "text-emerald-600 dark:text-emerald-400" : ""}`}
          >
            {formatDate(date, "d MMM yyyy")}
          </span>
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
    accessorKey: "ends_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fin" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("ends_at"))
      const isExpired = isPast(date)
      return (
        <div className="flex flex-col">
          <span
            className={`text-sm ${isExpired ? "text-red-600 dark:text-red-400" : ""}`}
          >
            {formatDate(date, "d MMM yyyy")}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(date, "h:mm a")}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Notas" />
    ),
    cell: ({ row }) => (
      <p className="text-sm text-muted-foreground">
        {row.getValue("notes") || "-"}
      </p>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as AdminReservation["status"]
      return (
        <Badge variant="outline" className={statusColors[status]}>
          {status === "active" && <Clock />}
          {status === "completed" && <Check />}
          {status === "cancelled" && <X />}
          {status === "expired" && <Clock />}
          {statusLabels[status]}
        </Badge>
      )
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
]
