"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableToolbar } from "@/components/ui/data-table-toolbar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { authorizeUser, changeUserRole } from "@/lib/actions/users/manage"
import type { AdminUser } from "@/lib/types/users"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table"
import { CheckCircle, Loader2 } from "lucide-react"
import * as React from "react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

const ROLE_LABELS: Record<string, string> = {
  pending: "Pendiente",
  user: "Usuario",
  admin: "Administrador",
  root: "Root",
}

const ROLE_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  user: "secondary",
  admin: "default",
  root: "destructive",
}

// Global filter: match name or email
const globalFilterFn: FilterFn<AdminUser> = (
  row,
  _columnId,
  filterValue: string,
) => {
  const search = filterValue.toLowerCase()
  const name = (row.original.full_name ?? "").toLowerCase()
  const email = row.original.email.toLowerCase()
  return name.includes(search) || email.includes(search)
}

interface UsersTableProps {
  users: AdminUser[]
  callerRole: string
}

export function UsersTable({ users, callerRole }: UsersTableProps) {
  const isRoot = callerRole === "root"
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })

  function handleAuthorize(userId: string) {
    setLoadingId(userId)
    startTransition(async () => {
      const result = await authorizeUser(userId)
      setLoadingId(null)
      if (result.error) toast.error(result.error)
      else toast.success("Usuario autorizado correctamente")
    })
  }

  function handleChangeRole(userId: string, newRole: string) {
    setLoadingId(userId)
    startTransition(async () => {
      const result = await changeUserRole(userId, newRole)
      setLoadingId(null)
      if (result.error) toast.error(result.error)
      else toast.success("Rol actualizado correctamente")
    })
  }

  const columns = React.useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Nombre" />
        ),
        cell: ({ row }) =>
          row.original.full_name ? (
            <span className="font-medium">{row.original.full_name}</span>
          ) : (
            <span className="text-muted-foreground italic">Sin nombre</span>
          ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => (
          <Badge variant={ROLE_BADGE_VARIANT[row.original.role] ?? "outline"}>
            {ROLE_LABELS[row.original.role] ?? row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Registrado" />
        ),
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original
          const isLoading = loadingId === user.id && isPending

          return (
            <div className="flex items-center justify-end gap-2">
              {user.role === "pending" && (
                <Button
                  size="sm"
                  disabled={isLoading}
                  onClick={() => handleAuthorize(user.id)}
                >
                  {isLoading ? (
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                  )}
                  Autorizar
                </Button>
              )}
              {isRoot && user.role !== "root" && (
                <Select
                  defaultValue={user.role}
                  disabled={isLoading}
                  onValueChange={(val) => handleChangeRole(user.id, val)}
                >
                  <SelectTrigger className="h-8 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          )
        },
      },
    ],
    [isPending, isRoot, loadingId],
  )

  const table = useReactTable({
    data: users,
    columns,
    globalFilterFn,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
  })

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <DataTableToolbar
        table={table}
        useGlobalFilter={true}
        searchPlaceholder="Buscar por nombre o email..."
      />

      {/* table */}
      <DataTable
        table={table}
        columnsLength={columns.length}
        emptyMessage="No hay usuarios registrados."
      />
    </div>
  )
}
