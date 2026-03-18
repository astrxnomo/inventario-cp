"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteItem } from "@/lib/actions/items/manage"
import type { CabinetItemAdmin } from "@/lib/types/cabinets"
import type { Category } from "@/lib/types/categories"
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
} from "@tanstack/react-table"
import { ArrowUpDown, Loader2, Trash2 } from "lucide-react"
import * as React from "react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { ItemFormDialog } from "./item-form-dialog"

interface Props {
  cabinetId: string
  items: CabinetItemAdmin[]
  categories: Category[]
}

export function ItemsTable({ cabinetId, items, categories }: Props) {
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )

  function handleDelete(id: string) {
    setLoadingId(id)
    startTransition(async () => {
      const result = await deleteItem(id)
      setLoadingId(null)
      setDeleteConfirmId(null)
      if (result.error) toast.error(result.error)
      else toast.success("Artículo eliminado")
    })
  }

  const columns = React.useMemo<ColumnDef<CabinetItemAdmin>[]>(
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
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "category_name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Categoría
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.category_name}
          </span>
        ),
      },
      {
        accessorKey: "quantity",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Cantidad
            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.quantity}</span>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original
          const isLoading = loadingId === item.id && isPending
          const isConfirm = deleteConfirmId === item.id

          return (
            <div className="flex items-center justify-end gap-1.5">
              <ItemFormDialog
                cabinetId={cabinetId}
                categories={categories}
                item={item}
              />
              {isConfirm ? (
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isLoading}
                  onClick={() => handleDelete(item.id)}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "¿Confirmar?"
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteConfirmId(item.id)}
                  aria-label="Eliminar artículo"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [cabinetId, categories, deleteConfirmId, isPending, loadingId],
  )

  const table = useReactTable({
    data: items,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, columnFilters },
  })

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar artículos..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
          className="max-w-xs"
        />
        <div className="ml-auto">
          <ItemFormDialog cabinetId={cabinetId} categories={categories} />
        </div>
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
                  {items.length === 0
                    ? "Este gabinete no tiene artículos aún."
                    : "Sin resultados para la búsqueda."}
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
