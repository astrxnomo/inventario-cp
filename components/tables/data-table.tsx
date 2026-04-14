"use client"

import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table"
import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { normalizeSearchText } from "@/lib/utils"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import type { DataTableFilterField } from "@/lib/types/data-table"

// Función de filtrado personalizada para búsqueda flexible
const fuzzyFilter: FilterFn<any> = (row, columnId, value) => {
  const itemValue = row.getValue(columnId)

  const searchValue = normalizeSearchText(value)
  if (!searchValue) return true

  const cellValue = normalizeSearchText(itemValue)

  return cellValue.includes(searchValue)
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchColumn?: keyof TData
  searchPlaceholder?: string
  filterFields?: DataTableFilterField<TData>[]
  toolbar?: (props: {
    table: ReturnType<typeof useReactTable<TData>>
  }) => React.ReactNode
  showPagination?: boolean
  showToolbar?: boolean
  pageSize?: number
  showDateFilter?: boolean
  dateFilterColumn?: keyof TData
  onDateRangeChange?: (from: string, to: string) => void
  dateFrom?: string
  dateTo?: string
  pageCount?: number
  manualPagination?: boolean
  // Controlled state props
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  meta?: any
  actions?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  searchPlaceholder = "Buscar...",
  filterFields,
  toolbar,
  showPagination = true,
  showToolbar = true,
  pageSize = 10,
  showDateFilter = false,
  dateFilterColumn,
  onDateRangeChange,
  dateFrom,
  dateTo,
  pageCount,
  manualPagination = false,
  // Controlled state destructuring
  pagination: controlledPagination,
  onPaginationChange: controlledOnPaginationChange,
  sorting: controlledSorting,
  onSortingChange: controlledOnSortingChange,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange: controlledOnColumnFiltersChange,
  meta,
  actions,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})

  // Internal state
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>([])
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize,
    })

  // Derived state (controlled or internal)
  const pagination = controlledPagination ?? internalPagination
  const sorting = controlledSorting ?? internalSorting
  const columnFilters = controlledColumnFilters ?? internalColumnFilters

  // Sincronizar pageSize si cambia desde props (solo si no es controlado)
  React.useEffect(() => {
    if (!controlledPagination) {
      setInternalPagination((prev) => ({ ...prev, pageSize }))
    }
  }, [pageSize, controlledPagination])

  // Handlers
  const onPaginationChange: OnChangeFn<PaginationState> = React.useCallback(
    (updater) => {
      if (controlledOnPaginationChange) {
        controlledOnPaginationChange(updater)
      } else {
        setInternalPagination((old) => {
          const newState =
            typeof updater === "function" ? updater(old) : updater
          return newState
        })
      }
    },
    [controlledOnPaginationChange],
  )

  const onSortingChange: OnChangeFn<SortingState> = React.useCallback(
    (updater) => {
      if (controlledOnSortingChange) {
        controlledOnSortingChange(updater)
      } else {
        setInternalSorting((old) => {
          const newState =
            typeof updater === "function" ? updater(old) : updater
          return newState
        })
      }
    },
    [controlledOnSortingChange],
  )

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> =
    React.useCallback(
      (updater) => {
        if (controlledOnColumnFiltersChange) {
          controlledOnColumnFiltersChange(updater)
        } else {
          setInternalColumnFilters((old) => {
            const newState =
              typeof updater === "function" ? updater(old) : updater
            return newState
          })
        }
      },
      [controlledOnColumnFiltersChange],
    )

  const table = useReactTable({
    data,
    columns,
    pageCount: manualPagination ? pageCount : undefined,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      pagination,
    },
    meta,
    enableRowSelection: true,
    manualPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: onSortingChange,
    onColumnFiltersChange: onColumnFiltersChange,
    onPaginationChange: onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: !manualPagination
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // Usar el filtro personalizado para la columna de búsqueda
    globalFilterFn: fuzzyFilter,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    autoResetPageIndex: false,
  })

  return (
    <div className="space-y-4">
      {showToolbar && (
        <>
          {toolbar ? (
            toolbar({ table })
          ) : (
            <DataTableToolbar
              table={table}
              searchColumn={searchColumn}
              searchPlaceholder={searchPlaceholder}
              filterFields={filterFields}
              showDateFilter={showDateFilter}
              dateFilterColumn={dateFilterColumn}
              onDateRangeChange={onDateRangeChange}
              dateFrom={dateFrom}
              dateTo={dateTo}
              columnFilters={columnFilters}
              actions={actions}
            />
          )}
        </>
      )}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
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
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && (
        <DataTablePagination table={table} paginationState={pagination} />
      )}
    </div>
  )
}
