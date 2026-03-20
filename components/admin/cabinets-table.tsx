"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableToolbar } from "@/components/ui/data-table-toolbar"
import { deleteCabinet, toggleCabinetLock } from "@/lib/actions/cabinets/manage"
import type { CabinetAdmin } from "@/lib/types/cabinets"
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
  type VisibilityState,
} from "@tanstack/react-table"
import { Loader2, Lock, LockOpen, Package, Trash2 } from "lucide-react"
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
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })

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
          <DataTableColumnHeader column={column} title="Nombre" />
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
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Ubicación" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.location || "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Estado" />
        ),
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status] ?? "outline"}>
            {STATUS_LABEL[row.original.status] ?? row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "item_count",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Artículos" />
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
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchKey="name"
        searchPlaceholder="Buscar gabinete..."
      >
        <CabinetFormDialog />
      </DataTableToolbar>
      <DataTable
        table={table}
        columnsLength={columns.length}
        emptyMessage="No hay gabinetes registrados."
      />
    </div>
  )
}
