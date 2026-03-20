import { type Table } from "@tanstack/react-table"
import { ChevronDown, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  useGlobalFilter?: boolean
  searchPlaceholder?: string
  children?: React.ReactNode // for custom buttons like "Add"
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  useGlobalFilter,
  searchPlaceholder = "Buscar...",
  children,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || !!table.getState().globalFilter

  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="flex w-full flex-1 flex-wrap items-center gap-2 sm:w-auto">
        {(searchKey || useGlobalFilter) && (
          <Input
            placeholder={searchPlaceholder}
            value={
              useGlobalFilter
                ? ((table.getState().globalFilter as string) ?? "")
                : ((table.getColumn(searchKey!)?.getFilterValue() as string) ??
                  "")
            }
            onChange={(event) => {
              if (useGlobalFilter) {
                table.setGlobalFilter(event.target.value)
              } else {
                table.getColumn(searchKey!)?.setFilterValue(event.target.value)
              }
              table.setPageIndex(0)
            }}
            className="h-8 w-full sm:max-w-xs lg:w-70"
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              table.setGlobalFilter("")
              table.setPageIndex(0)
            }}
            className="h-8 px-2 lg:px-3"
          >
            Limpiar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden h-8 lg:flex">
              Columnas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-37.5">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" &&
                  column.getCanHide(),
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
