"use client"

import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import type {
  MaintenanceHistoryEntry,
  MaintenanceItem,
} from "@/lib/types/maintenance"
import type { InventoryItem } from "@/lib/types/inventory"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Archive,
  CalendarClock,
  ClipboardClock,
  ClockAlert,
  Clock4,
  User,
  Wrench,
} from "lucide-react"
import { MaintenanceHistoryActions } from "./maintenance-history-actions"
import { MaintenanceItemActions } from "./maintenance-item-actions"
import { RegisterHistoryButton } from "./register-history-button"

type MaintenanceTableMeta = {
  inventoryItems?: InventoryItem[]
  maintenanceItems?: MaintenanceItem[]
}

export const maintenanceColumns: ColumnDef<MaintenanceItem>[] = [
  {
    accessorKey: "item_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Articulo" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-medium">
        <Wrench className="size-4 text-muted-foreground" />
        <span>{row.getValue("item_name")}</span>
      </div>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: true,
  },
  {
    accessorKey: "cabinet_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gabinete" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">
        <Archive className="size-3" />
        {(row.getValue("cabinet_name") as string) || "Sin gabinete"}
      </Badge>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: true,
  },
  {
    accessorKey: "interval_days",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Intervalo" />
    ),
    cell: ({ row }) => {
      const days = row.getValue("interval_days") as number
      return (
        <Badge variant="outline" className="gap-1">
          <Clock4 className="size-3" />
          Cada {days} dia{days !== 1 ? "s" : ""}
        </Badge>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "days_until_next_maintenance",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Próximo mantenimiento" />
    ),
    cell: ({ row }) => {
      const daysLeft = row.original.days_until_next_maintenance
      const status = row.original.maintenance_status
      const lastMaintenanceAt = row.original.last_maintenance_at

      if (!lastMaintenanceAt) {
        return (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <ClipboardClock className="size-3" />
            No ha registrado mantenimiento
          </Badge>
        )
      }

      if (status === "overdue") {
        return (
          <Badge variant="destructive" className="gap-1">
            <ClockAlert className="size-3" />
            Vencido hace {Math.abs(daysLeft)} dia
            {Math.abs(daysLeft) !== 1 ? "s" : ""}
          </Badge>
        )
      }

      if (status === "due_soon") {
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500 text-amber-700 dark:text-amber-400"
          >
            <ClockAlert className="size-3" />
            En {daysLeft} dia{daysLeft !== 1 ? "s" : ""}
          </Badge>
        )
      }

      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-500 text-emerald-700 dark:text-emerald-400"
        >
          <Clock4 className="size-3" />
          En {daysLeft} dia{daysLeft !== 1 ? "s" : ""}
        </Badge>
      )
    },
    enableSorting: true,
  },

  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as MaintenanceTableMeta | undefined
      const inventoryItems = meta?.inventoryItems ?? []

      return (
        <div className="flex items-center gap-2">
          <RegisterHistoryButton
            maintenanceId={row.original.id}
            itemName={row.original.item_name}
          />
          <hr className="h-4 border" />
          <MaintenanceItemActions
            item={row.original}
            inventoryItems={inventoryItems}
          />
        </div>
      )
    },
  },
]

export const maintenanceHistoryColumns: ColumnDef<MaintenanceHistoryEntry>[] = [
  {
    accessorKey: "item_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Articulo" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-medium">
        <Wrench className="size-4 text-muted-foreground" />
        <span>{row.getValue("item_name")}</span>
      </div>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: true,
  },

  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Mantenimiento" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      return (
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {formatDate(date, "d MMM yyyy")}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(date, "h:mm a")}
            </p>
          </div>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "registered_by_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registrado por" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("registered_by_name") as string | null
      return (
        <div className="flex items-center gap-2">
          <User className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{name || "Sin nombre"}</span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registrado" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return (
        <div className="flex items-center gap-2">
          <ClipboardClock className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {formatDate(date, "d MMM yyyy")}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(date, "h:mm a")}
            </p>
          </div>
        </div>
      )
    },
    enableSorting: true,
  },

  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as MaintenanceTableMeta | undefined
      const maintenanceItems = meta?.maintenanceItems ?? []

      return (
        <MaintenanceHistoryActions
          entry={row.original}
          maintenanceItems={maintenanceItems}
        />
      )
    },
  },
]
