"use client"

import type { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { DateRangePicker } from "@/components/ui/date-range-picker"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import type { DataTableFilterField } from "./types"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterFields?: DataTableFilterField<TData>[]
  searchPlaceholder?: string
  searchColumn?: keyof TData
  showDateFilter?: boolean
  dateFilterColumn?: keyof TData
  onDateRangeChange?: (from: string, to: string) => void
  dateFrom?: string
  dateTo?: string
  children?: React.ReactNode
}

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
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || dateFrom || dateTo

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {searchColumn && (
          <Input
            placeholder={searchPlaceholder}
            value={
              (table
                .getColumn(String(searchColumn))
                ?.getFilterValue() as string) ?? ""
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
              />
            )
          }

          return null
        })}
        {showDateFilter && onDateRangeChange && (
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onChange={onDateRangeChange}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
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
    </div>
  )
}
