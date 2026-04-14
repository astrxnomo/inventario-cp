"use client"

import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { Ban, Clock, User } from "lucide-react"
import { UserActions } from "./user-actions"

export type UserProfile = {
  id: string
  user_id: string
  email: string
  full_name: string | null
  role: "pending" | "denied" | "user" | "admin" | "root"
  created_at: string
}

export const userRoleOptions = [
  { label: "Root", value: "root", icon: User },
  { label: "Admin", value: "admin", icon: User },
  { label: "Usuario", value: "user", icon: User },
  { label: "Pendiente", value: "pending", icon: Clock },
  { label: "Restringido", value: "denied", icon: Ban },
]

const roleColors = {
  root: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  admin:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  user: "bg-primary/10 text-primary-700 dark:text-primary-400 border-primary/20",
  pending:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  denied: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
}

const roleIcons = {
  root: User,
  admin: User,
  user: User,
  pending: Clock,
  denied: Ban,
}

const roleLabels = {
  root: "Root",
  admin: "Administrador",
  user: "Usuario",
  pending: "Pendiente",
  denied: "Restringido",
}

export const userColumns: ColumnDef<UserProfile>[] = [
  {
    accessorKey: "full_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      const Icon = User
      return (
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <span className="font-medium">
            {row.getValue("full_name") || "Sin nombre"}
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false,
    // @ts-expect-error - filterFn personalizado
    filterFn: "fuzzy",
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[150px] truncate" title={row.getValue("email")}>
        <span className="text-sm text-muted-foreground">
          {row.getValue("email")}
        </span>
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rol" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as UserProfile["role"]
      const Icon = roleIcons[role]
      return (
        <Badge variant="outline" className={roleColors[role]}>
          <Icon className="size-3" />
          {roleLabels[role]}
        </Badge>
      )
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de registro" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return (
        <span className="text-sm text-muted-foreground">
          {formatDate(date, "d 'de' MMM, yyyy")}
        </span>
      )
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <UserActions
        user={row.original}
        currentUserRole={(table.options.meta as any)?.currentUserRole}
        currentUserId={(table.options.meta as any)?.currentUserId}
      />
    ),
  },
]
