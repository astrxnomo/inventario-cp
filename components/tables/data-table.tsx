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
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import type { DataTableFilterField } from "./types"

// Función de filtrado personalizada para búsqueda flexible
const fuzzyFilter: FilterFn<any> = (row, columnId, value) => {
  const itemValue = row.getValue(columnId)

  // Si no hay valor de búsqueda, mostrar todo
  if (!value) return true

  // Convertir ambos a string y a minúsculas para comparación insensible a mayúsculas
  const searchValue = String(value).toLowerCase().trim()
  const cellValue = String(itemValue ?? "").toLowerCase()

  // Buscar si el texto de búsqueda está contenido en el valor de la celda
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
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // Usar el filtro personalizado para la columna de búsqueda
    globalFilterFn: fuzzyFilter,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
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
      {showPagination && <DataTablePagination table={table} />}
    </div>
  )
}
