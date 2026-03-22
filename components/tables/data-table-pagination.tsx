"use client"

import { type PaginationState, type Table } from "@tanstack/react-table"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
  /**
   * Optional pagination state to force re-render when the table instance is stable
   * but internal state changes (common with React Compiler / strict mode)
   */
  paginationState?: PaginationState
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
  paginationState,
}: DataTablePaginationProps<TData>) {
  // Use passed pagination state or fallback to table state
  // This ensures updates even if table instance is stable
  const pagination = paginationState ?? table.getState().pagination
  const { pageIndex, pageSize } = pagination

  return (
    <div className="flex items-center justify-between gap-4 px-2">
      <div className="hidden flex-1 text-sm text-muted-foreground sm:block">
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <>
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s)
          </>
        )}
      </div>
      <div className="flex items-center gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Filas por página</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Página {pageIndex + 1} de {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={pageIndex === 0}
          >
            <span className="sr-only">Ir a la primera página</span>
            <ChevronsLeftIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.setPageIndex(Math.max(0, pageIndex - 1))}
            disabled={pageIndex === 0}
          >
            <span className="sr-only">Ir a la página anterior</span>
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() =>
              table.setPageIndex(
                Math.min(Math.max(0, table.getPageCount() - 1), pageIndex + 1),
              )
            }
            disabled={pageIndex >= Math.max(0, table.getPageCount() - 1)}
          >
            <span className="sr-only">Ir a la página siguiente</span>
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={pageIndex >= Math.max(0, table.getPageCount() - 1)}
          >
            <span className="sr-only">Ir a la última página</span>
            <ChevronsRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
