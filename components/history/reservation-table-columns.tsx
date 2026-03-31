"use client"

import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ItemReservation } from "@/lib/types/reservations"
import { cn, formatDate, isAfter, isBefore } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import {
  Box,
  CalendarCheckIcon,
  CalendarClockIcon,
  CalendarIcon,
  CalendarXIcon,
  Clock,
  XCircle,
} from "lucide-react"

export type { ItemReservation }

const statusConfig = {
  active: {
    label: "Activa",
    variant: "default" as const,
    icon: Clock,
    className:
      "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  completed: {
    label: "Completada",
    variant: "secondary" as const,
    icon: CalendarCheckIcon,
    className: "",
  },
  cancelled: {
    label: "Cancelada",
    variant: "destructive" as const,
    icon: CalendarXIcon,
    className: "",
  },
  expired: {
    label: "Expirada",
    variant: "outline" as const,
    icon: CalendarClockIcon,
    className: "",
  },
}

export function getReservationStatusConfig(status: ItemReservation["status"]) {
  return statusConfig[status]
}

export const reservationColumns = (
  onCancel?: (reservation: ItemReservation) => void,
): ColumnDef<ItemReservation>[] => [
  {
    accessorKey: "item_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Articulo" />
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
    // @ts-expect-error - filterFn personalizado
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
            className={`size-4 ${isUpcoming ? "text-emerald-600" : "text-muted-foreground"}`}
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
            className={`size-4 ${isPast ? "text-destructive" : "text-muted-foreground"}`}
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
        <Badge
          variant={config.variant}
          className={cn("gap-1", config.className)}
        >
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
        <div className="max-w-50 truncate text-sm text-muted-foreground">
          {note || "—"}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const reservation = row.original
      const canCancel =
        reservation.can_cancel && reservation.status === "active"

      if (!canCancel) {
        return <span className="text-sm text-muted-foreground">—</span>
      }

      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onCancel?.(reservation)}
        >
          <XCircle className="size-4" />
          Cancelar
        </Button>
      )
    },
    enableSorting: false,
    enableHiding: false,
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
