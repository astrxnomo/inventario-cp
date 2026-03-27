"use client"

import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { AlertCircle, Archive, Lock, LogIn, Unlock, User } from "lucide-react"

export type AccessLog = {
  id: string
  user_id: string
  cabinet_id: string
  action: "open_requested" | "open_granted" | "open_denied" | "closed"
  created_at: string
  metadata: Record<string, any> | null
  // Joins
  user_name?: string
  user_email?: string
  cabinet_name?: string
}

export const actionOptions = [
  { label: "Apertura solicitada", value: "open_requested", icon: LogIn },
  { label: "Apertura", value: "open_granted", icon: Unlock },
  { label: "Apertura denegada", value: "open_denied", icon: AlertCircle },
  { label: "Cerrado", value: "closed", icon: Lock },
]

const actionColors = {
  open_requested:
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  open_granted:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  open_denied: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  closed: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
}

const actionIcons = {
  open_requested: LogIn,
  open_granted: Unlock,
  open_denied: AlertCircle,
  closed: Lock,
}

const actionLabels = {
  open_requested: "Apertura solicitada",
  open_granted: "Apertura",
  open_denied: "Apertura denegada",
  closed: "Cerrado",
}

export const activityLogColumns: ColumnDef<AccessLog>[] = [
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha y hora" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {formatDate(date, "d MMM yyyy")}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(date, "h:mm:ss a")}
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
      <Badge variant="outline">
        <Archive className="size-2" />
        {row.getValue("cabinet_name") || "Sin gabinete"}
      </Badge>
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
