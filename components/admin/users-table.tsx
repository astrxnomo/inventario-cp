"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { authorizeUser, changeUserRole } from "@/lib/actions/users/manage"
import type { AdminUser } from "@/lib/types/users"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowUpDown, CheckCircle, Loader2 } from "lucide-react"
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
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Nombre
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
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
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Email
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
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
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Registrado
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, columnFilters, globalFilter },
  })

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <Input
        placeholder="Buscar por nombre o email..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      {/* table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No hay usuarios registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {(() => {
            const pi = table.getState().pagination.pageIndex
            const ps = table.getState().pagination.pageSize
            const total = table.getFilteredRowModel().rows.length
            if (total === 0) return "Sin resultados"
            const from = pi * ps + 1
            const to = Math.min((pi + 1) * ps, total)
            return `Página ${pi + 1} de ${Math.max(table.getPageCount(), 1)} · ${from}–${to} de ${total}`
          })()}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
