"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { DatePicker } from "@/components/ui/date-picker"
import type { DataTableToolbarProps } from "@/lib/types/data-table"
import { format } from "@/lib/utils/date"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"

export function DataTableToolbar<TData>({
  table,
  filterFields = [],
  searchPlaceholder = "Buscar...",
  searchColumn,
  showDateFilter = false,
  onDateRangeChange,
  dateFrom = "",
  dateTo = "",
  children,
  columnFilters,
  actions,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    (columnFilters ?? table.getState().columnFilters).length > 0 ||
    dateFrom ||
    dateTo

  return (
    <div className="flex flex-col-reverse justify-between gap-4 md:flex-row md:items-center">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searchColumn && (
          <Input
            placeholder={searchPlaceholder}
            value={
              (columnFilters
                ? (columnFilters.find((f) => f.id === String(searchColumn))
                    ?.value as string)
                : (table
                    .getColumn(String(searchColumn))
                    ?.getFilterValue() as string)) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn(String(searchColumn))
                ?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {filterFields.map((field) => {
          const column = table.getColumn(String(field.id))
          if (!column) return null

          if (field.options) {
            return (
              <DataTableFacetedFilter
                key={String(field.id)}
                column={column}
                title={field.label}
                options={field.options}
                filterValues={
                  columnFilters?.find((f) => f.id === String(field.id))
                    ?.value as string[]
                }
              />
            )
          }

          return null
        })}
        {showDateFilter && onDateRangeChange && (
          <DatePicker
            value={dateFrom ? new Date(`${dateFrom}T00:00:00`) : undefined}
            onChange={(date) => {
              if (date) {
                const str = format(date, "yyyy-MM-dd")
                onDateRangeChange(str, str)
              } else {
                onDateRangeChange("", "")
              }
            }}
            placeholder="Fecha"
            className="h-8 w-auto"
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              table.resetGlobalFilter()
              table.setPageIndex(0)
              if (onDateRangeChange) {
                onDateRangeChange("", "")
              }
            }}
            className="h-8 px-2 lg:px-3"
          >
            Limpiar
            <X className="ml-2 size-4" />
          </Button>
        )}
        {children}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
