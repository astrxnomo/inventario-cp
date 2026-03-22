"use client"

import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ActionButtonsRow } from "@/components/admin/action-buttons-row"
import { ChangeRoleDialog } from "./change-role-dialog"
import { EditUserDialog } from "./edit-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authorizeUser } from "@/lib/actions/users/authorize-user"
import { deleteUser } from "@/lib/actions/users/delete-user"
import { formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import {
  CheckCircle,
  Clock,
  MoreHorizontal,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react"
import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"

export type UserProfile = {
  id: string
  user_id: string
  email: string
  full_name: string | null
  role: "pending" | "user" | "admin" | "root"
  created_at: string
}

export const userRoleOptions = [
  { label: "Root", value: "root", icon: ShieldAlert },
  { label: "Admin", value: "admin", icon: ShieldCheck },
  { label: "Usuario", value: "user", icon: User },
  { label: "Pendiente", value: "pending", icon: Clock },
]

const roleColors = {
  root: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  admin: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  user: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  pending: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
}

const roleIcons = {
  root: ShieldAlert,
  admin: ShieldCheck,
  user: User,
  pending: Clock,
}

const roleLabels = {
  root: "Root",
  admin: "Admin",
  user: "Usuario",
  pending: "Pendiente",
}

function UserActions({
  user,
  currentUserRole,
  currentUserId,
}: {
  user: UserProfile
  currentUserRole?: string
  currentUserId?: string
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUser(user.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Usuario eliminado correctamente")
        setShowDeleteDialog(false)
      }
    })
  }

  const handleAuthorize = () => {
    startTransition(async () => {
      const result = await authorizeUser(user.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Usuario autorizado correctamente")
      }
    })
  }

  const handleOpenEdit = () => setShowEditDialog(true)
  const handleOpenChangeRole = () => {
    if (user.id === currentUserId || user.user_id === currentUserId) {
      toast.error("No puedes cambiar tu propio rol")
      return
    }
    setShowRoleDialog(true)
  }

  return (
    <>
      <ActionButtonsRow
        onEdit={handleOpenEdit}
        onDelete={async () => {
          setShowDeleteDialog(true)
          return {}
        }}
        actions={
          [
            user.role === "pending"
              ? {
                  icon: <CheckCircle className="h-4 w-4 text-green-600" />,
                  onClick: handleAuthorize,
                  label: "Autorizar",
                  visible: true,
                }
              : null,
            {
              icon: <ShieldAlert className="h-4 w-4" />,
              onClick: handleOpenChangeRole,
              label: "Cambiar rol",
              visible: currentUserRole === "root",
              disabled:
                user.id === currentUserId || user.user_id === currentUserId,
            },
          ].filter(Boolean) as any
        }
      />

      <EditUserDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        user={user}
      />

      <ChangeRoleDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={user}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="¿Estás seguro?"
        description={`Esta acción eliminará al usuario "${user.full_name || user.email}". Si el usuario tiene registros asociados, la eliminación podría fallar.`}
        onConfirm={handleDelete}
        confirmLabel="Eliminar"
        intent="destructive"
        isLoading={isPending}
      />
    </>
  )
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
