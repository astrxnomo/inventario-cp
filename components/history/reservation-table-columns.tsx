"use client"

import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import type { ItemReservation } from "@/lib/types/reservations"
import { formatDate, isAfter, isBefore } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import {
  Box,
  CalendarCheckIcon,
  CalendarClockIcon,
  CalendarIcon,
  CalendarXIcon,
} from "lucide-react"

export type { ItemReservation }

const statusConfig = {
  active: {
    label: "Activa",
    variant: "default" as const,
    icon: CalendarCheckIcon,
  },
  completed: {
    label: "Completada",
    variant: "secondary" as const,
    icon: CalendarCheckIcon,
  },
  cancelled: {
    label: "Cancelada",
    variant: "destructive" as const,
    icon: CalendarXIcon,
  },
  expired: {
    label: "Expirada",
    variant: "outline" as const,
    icon: CalendarClockIcon,
  },
}

export const reservationColumns: ColumnDef<ItemReservation>[] = [
  {
    accessorKey: "item_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Item" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Box className="size-4 text-muted-foreground" />
            <span className="font-medium">{row.getValue("item_name")}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.item_category}
          </div>
        </div>
      )
    },
    enableHiding: false,
    // @ts-ignore - filterFn personalizado
    filterFn: "fuzzy",
  },
  {
    accessorKey: "cabinet_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gabinete" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {row.getValue("cabinet_name")}
        </div>
      )
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="secondary" className="font-mono">
          {row.getValue("quantity")}
        </Badge>
      )
    },
  },
  {
    accessorKey: "starts_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Inicio" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("starts_at"))
      const isUpcoming = isAfter(date, new Date())

      return (
        <div className="flex items-center gap-2">
          <CalendarIcon
            className={`size-4 ${isUpcoming ? "text-blue-600" : "text-muted-foreground"}`}
          />
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
    accessorKey: "ends_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fin" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("ends_at"))
      const isPast = isBefore(date, new Date())

      return (
        <div className="flex items-center gap-2">
          <CalendarIcon
            className={`size-4 ${isPast ? "text-red-600" : "text-muted-foreground"}`}
          />
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
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as ItemReservation["status"]
      const config = statusConfig[status]
      const Icon = config.icon

      return (
        <Badge variant={config.variant} className="gap-1">
          <Icon className="size-3" />
          {config.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "note",
    header: "Nota",
    cell: ({ row }) => {
      const note = row.getValue("note") as string | null
      return (
        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
          {note || "—"}
        </div>
      )
    },
  },
]

export const reservationStatusOptions = [
  {
    label: "Activa",
    value: "active",
    icon: CalendarCheckIcon,
  },
  {
    label: "Completada",
    value: "completed",
    icon: CalendarCheckIcon,
  },
  {
    label: "Cancelada",
    value: "cancelled",
    icon: CalendarXIcon,
  },
  {
    label: "Expirada",
    value: "expired",
    icon: CalendarClockIcon,
  },
]
