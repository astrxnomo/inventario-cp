"use client"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableToolbar } from "@/components/ui/data-table-toolbar"
import { deleteItem } from "@/lib/actions/items/manage"
import type { CabinetItemAdmin } from "@/lib/types/cabinets"
import type { Category } from "@/lib/types/categories"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table"
import { Loader2, Trash2 } from "lucide-react"
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
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })

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
          <DataTableColumnHeader column={column} title="Nombre" />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "category_name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Categoría" />
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
          <DataTableColumnHeader column={column} title="Cantidad" />
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
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchKey="name"
        searchPlaceholder="Buscar artículos..."
      >
        <ItemFormDialog cabinetId={cabinetId} categories={categories} />
      </DataTableToolbar>
      <DataTable
        table={table}
        columnsLength={columns.length}
        emptyMessage={
          items.length === 0
            ? "Este gabinete no tiene artículos aún."
            : "Sin resultados para la búsqueda."
        }
      />
    </div>
  )
}
