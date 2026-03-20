"use client"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableToolbar } from "@/components/ui/data-table-toolbar"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { AccessLogEntry } from "@/lib/types/logs"
import { cn } from "@/lib/utils"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table"
import * as React from "react"

function fmtFull(dateStr: string) {
  return new Date(dateStr).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const ACCESS_LABELS: Record<string, string> = {
  open_requested: "Solicitud",
  open_granted: "Apertura",
  open_denied: "Denegado",
  closed: "Cierre",
}

const ACCESS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  open_requested: "outline",
  open_granted: "default",
  open_denied: "destructive",
  closed: "secondary",
}

const logsGlobalFilter: FilterFn<AccessLogEntry> = (row, _id, value) => {
  const q = value.toLowerCase()
  return (
    (row.original.user_name ?? "").toLowerCase().includes(q) ||
    (row.original.cabinet_name ?? "").toLowerCase().includes(q)
  )
}

type ActionFilter =
  | "all"
  | "open_requested"
  | "open_granted"
  | "open_denied"
  | "closed"

const ACTION_FILTER_OPTS: { id: ActionFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "open_requested", label: "Solicitud" },
  { id: "open_granted", label: "Apertura" },
  { id: "open_denied", label: "Denegado" },
  { id: "closed", label: "Cierre" },
]

const ACCESS_LOG_COLUMNS: ColumnDef<AccessLogEntry>[] = [
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {fmtFull(row.original.created_at)}
      </span>
    ),
  },
  {
    accessorKey: "cabinet_name",
    header: "Gabinete",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.cabinet_name ?? "—"}</span>
    ),
  },
  {
    accessorKey: "user_name",
    header: "Usuario",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.user_name ?? "Sistema"}
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: "Evento",
    cell: ({ row }) => (
      <Badge variant={ACCESS_VARIANT[row.original.action] ?? "outline"}>
        {ACCESS_LABELS[row.original.action] ?? row.original.action}
      </Badge>
    ),
  },
]

export function ActivityTable({
  accessLogs,
}: {
  accessLogs: AccessLogEntry[]
}) {
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [actionFilter, setActionFilter] = React.useState<ActionFilter>("all")
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "created_at", desc: true },
  ])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  })

  function handleActionChange(nextAction: ActionFilter) {
    setActionFilter(nextAction)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  function handleDateRangeChange(from: string, to: string) {
    setDateFrom(from)
    setDateTo(to)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const preFiltered = React.useMemo(() => {
    return accessLogs.filter((log) => {
      const d = log.created_at.slice(0, 10)
      const matchFrom = !dateFrom || d >= dateFrom
      const matchTo = !dateTo || d <= dateTo
      const matchAction = actionFilter === "all" || log.action === actionFilter
      return matchFrom && matchTo && matchAction
    })
  }, [accessLogs, dateFrom, dateTo, actionFilter])

  const table = useReactTable({
    data: preFiltered,
    columns: ACCESS_LOG_COLUMNS,
    globalFilterFn: logsGlobalFilter,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      globalFilter,
      pagination,
    },
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        useGlobalFilter={true}
        searchPlaceholder="Buscar por usuario o gabinete..."
      >
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1">
          {ACTION_FILTER_OPTS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleActionChange(opt.id)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                actionFilter === opt.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onChange={handleDateRangeChange}
        />
        <span className="ml-auto hidden text-xs text-muted-foreground sm:inline-flex">
          {table.getFilteredRowModel().rows.length} registro
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </span>
      </DataTableToolbar>

      <DataTable
        table={table}
        columnsLength={ACCESS_LOG_COLUMNS.length}
        emptyMessage="Sin registros."
      />
    </div>
  )
}
