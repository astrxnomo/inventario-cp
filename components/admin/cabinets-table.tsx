"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteCabinet, toggleCabinetLock } from "@/lib/actions/cabinets/manage"
import type { CabinetAdmin } from "@/lib/types/cabinets"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  ChevronDown,
  Loader2,
  Lock,
  LockOpen,
  Package,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { CabinetFormDialog } from "./cabinet-form-dialog"

const STATUS_LABEL: Record<string, string> = {
  available: "Disponible",
  in_use: "En uso",
  locked: "Bloqueado",
}

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  available: "secondary",
  in_use: "default",
  locked: "destructive",
}

export function CabinetsTable({ cabinets }: { cabinets: CabinetAdmin[] }) {
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  function handleLockToggle(cabinet: CabinetAdmin) {
    const lock = cabinet.status !== "locked"
    setLoadingId(cabinet.id + "-lock")
    startTransition(async () => {
      const result = await toggleCabinetLock(cabinet.id, lock)
      setLoadingId(null)
      if (result.error) toast.error(result.error)
      else toast.success(lock ? "Gabinete bloqueado" : "Gabinete desbloqueado")
    })
  }

  function handleDelete(id: string) {
    setLoadingId(id + "-del")
    startTransition(async () => {
      const result = await deleteCabinet(id)
      setLoadingId(null)
      setDeleteConfirmId(null)
      if (result.error) toast.error(result.error)
      else toast.success("Gabinete eliminado")
    })
  }

  const columns = React.useMemo<ColumnDef<CabinetAdmin>[]>(
    () => [
      {
        accessorKey: "name",
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
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            {row.original.description && (
              <div className="text-xs text-muted-foreground">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "location",
        header: "Ubicación",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.location || "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status] ?? "outline"}>
            {STATUS_LABEL[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "item_count",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Artículos
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.item_count}
          </span>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const cabinet = row.original
          const isLockLoading = loadingId === cabinet.id + "-lock" && isPending
          const isDelLoading = loadingId === cabinet.id + "-del" && isPending
          const isDelConfirm = deleteConfirmId === cabinet.id

          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/cabinets/${cabinet.id}`}>
                  <Package className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">
                    Artículos
                  </span>
                </Link>
              </Button>
              <CabinetFormDialog cabinet={cabinet} />
              <Button
                size="sm"
                variant="outline"
                disabled={isLockLoading || cabinet.status === "in_use"}
                onClick={() => handleLockToggle(cabinet)}
                aria-label={
                  cabinet.status === "locked"
                    ? "Desbloquear gabinete"
                    : "Bloquear gabinete"
                }
              >
                {isLockLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : cabinet.status === "locked" ? (
                  <LockOpen className="h-3.5 w-3.5" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
              </Button>
              {isDelConfirm ? (
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isDelLoading}
                  onClick={() => handleDelete(cabinet.id)}
                >
                  {isDelLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "¿Confirmar?"
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteConfirmId(cabinet.id)}
                  aria-label="Eliminar gabinete"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [deleteConfirmId, isPending, loadingId],
  )

  const table = useReactTable({
    data: cabinets,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, columnFilters, columnVisibility },
  })

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar gabinetes..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
          className="max-w-xs"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columnas <ChevronDown className="ml-1.5 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(val) => col.toggleVisibility(!!val)}
                  className="capitalize"
                >
                  {col.id === "name"
                    ? "Nombre"
                    : col.id === "location"
                      ? "Ubicación"
                      : col.id === "status"
                        ? "Estado"
                        : col.id === "item_count"
                          ? "Artículos"
                          : col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CabinetFormDialog />
      </div>

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
                  No hay gabinetes registrados.
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
