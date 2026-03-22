"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { LogIn, LogOut, Lock, Unlock, AlertCircle, User } from "lucide-react"

export type AccessLog = {
  id: string
  user_id: string
  cabinet_id: string
  action: "open" | "close" | "lock" | "unlock" | "error"
  timestamp: string
  metadata: Record<string, any> | null
  // Joins
  user_name?: string
  user_email?: string
  cabinet_name?: string
}

export const actionOptions = [
  { label: "Abrir", value: "open", icon: Unlock },
  { label: "Cerrar", value: "close", icon: Lock },
  { label: "Bloquear", value: "lock", icon: Lock },
  { label: "Desbloquear", value: "unlock", icon: Unlock },
  { label: "Error", value: "error", icon: AlertCircle },
]

const actionColors = {
  open: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  close: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  lock: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  unlock:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  error: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
}

const actionIcons = {
  open: Unlock,
  close: Lock,
  lock: Lock,
  unlock: Unlock,
  error: AlertCircle,
}

const actionLabels = {
  open: "Abrir",
  close: "Cerrar",
  lock: "Bloquear",
  unlock: "Desbloquear",
  error: "Error",
}

export const activityLogColumns: ColumnDef<AccessLog>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha y hora" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("timestamp"))
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {format(date, "d MMM yyyy", { locale: es })}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(date, "HH:mm:ss", { locale: es })}
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "user_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Usuario" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <User className="size-3 text-muted-foreground" />
            <span className="text-sm font-medium">
              {row.getValue("user_name") || "Sin nombre"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {row.original.user_email}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "cabinet_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gabinete" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("cabinet_name")}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Acción" />
    ),
    cell: ({ row }) => {
      const action = row.getValue("action") as AccessLog["action"]
      const Icon = actionIcons[action]
      return (
        <Badge variant="outline" className={actionColors[action]}>
          <Icon className="mr-1 size-3" />
          {actionLabels[action]}
        </Badge>
      )
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
]
