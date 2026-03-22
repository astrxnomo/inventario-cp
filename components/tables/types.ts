import type { Table } from "@tanstack/react-table"

export interface DataTableFilterField<TData> {
  id: keyof TData
  label: string
  placeholder?: string
  options?: Array<{
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }>
}

export interface DataTableFilterOption {
  id: string
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  withCount?: boolean
}

export interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterFields?: DataTableFilterField<TData>[]
  searchPlaceholder?: string
  searchColumn?: keyof TData
  children?: React.ReactNode
  showDateFilter?: boolean
  dateFilterColumn?: keyof TData
  onDateRangeChange?: (from: string, to: string) => void
  dateFrom?: string
  dateTo?: string
}
