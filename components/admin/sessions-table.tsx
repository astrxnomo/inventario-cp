"use client"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableToolbar } from "@/components/ui/data-table-toolbar"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { SessionWithItems } from "@/lib/types/logs"
import { cn } from "@/lib/utils"
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
  type PaginationState,
} from "@tanstack/react-table"
import { ChevronDown, ChevronRight, Clock, Package } from "lucide-react"
import * as React from "react"

function fmtTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function fmtFull(dateStr: string) {
  return new Date(dateStr).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function duration(open: string, close: string | null) {
  if (!close) return null
  const mins = Math.round(
    (new Date(close).getTime() - new Date(open).getTime()) / 60000,
  )
  if (mins < 1) return "< 1 min"
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}min`
}

function initials(name: string | null) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

type StatusFilter = "all" | "active" | "closed"

const SESSION_STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "active", label: "Activas" },
  { id: "closed", label: "Cerradas" },
]

const sessionGlobalFilter: FilterFn<SessionWithItems> = (row, _id, value) => {
  const q = value.toLowerCase()
  const s = row.original
  return (
    (s.user_name ?? "").toLowerCase().includes(q) ||
    (s.cabinet_name ?? "").toLowerCase().includes(q) ||
    s.items.some((i) => (i.item_name ?? "").toLowerCase().includes(q))
  )
}

export function SessionsTable({ sessions }: { sessions: SessionWithItems[] }) {
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [sorting, setSorting] = React.useState([
    { id: "opened_at", desc: true },
  ])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })

  function handleStatusChange(nextStatus: StatusFilter) {
    setStatus(nextStatus)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  function handleDateRangeChange(from: string, to: string) {
    setDateFrom(from)
    setDateTo(to)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const preFiltered = React.useMemo(() => {
    return sessions.filter((s) => {
      const matchStatus =
        status === "all" ||
        (status === "active" && !s.closed_at) ||
        (status === "closed" && !!s.closed_at)
      const d = s.opened_at.slice(0, 10)
      const matchFrom = !dateFrom || d >= dateFrom
      const matchTo = !dateTo || d <= dateTo
      return matchStatus && matchFrom && matchTo
    })
  }, [sessions, status, dateFrom, dateTo])

  const columns = React.useMemo<ColumnDef<SessionWithItems>[]>(
    () => [
      {
        id: "expander",
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <button
              {...{
                onClick: row.getToggleExpandedHandler(),
                style: { cursor: "pointer" },
                className: "rounded-sm p-1 hover:bg-muted",
              }}
              aria-label={
                row.getIsExpanded() ? "Contraer detalles" : "Expandir detalles"
              }
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : null
        },
      },
      {
        accessorKey: "user_name",
        header: "Usuario",
        cell: ({ row }) => {
          const s = row.original
          return (
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {initials(s.user_name)}
              </span>
              <span className="font-medium text-foreground">
                {s.user_name ?? "—"}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "cabinet_name",
        header: "Gabinete",
        cell: ({ getValue }) => (
          <span className="text-foreground">{getValue<string>() ?? "—"}</span>
        ),
      },
      {
        accessorKey: "opened_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Apertura" />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {fmtFull(row.original.opened_at)}
          </span>
        ),
      },
      {
        accessorKey: "closed_at",
        header: "Duración / Cierre",
        cell: ({ row }) => {
          const s = row.original
          const dur = duration(s.opened_at, s.closed_at)
          return (
            <div className="flex flex-col">
              {s.closed_at ? (
                <span className="whitespace-nowrap text-muted-foreground">
                  {fmtFull(s.closed_at)}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
              {dur && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {dur}
                </span>
              )}
            </div>
          )
        },
      },
      {
        id: "status",
        header: "Estado",
        cell: ({ row }) => {
          const s = row.original
          return s.closed_at ? (
            <Badge variant="secondary">Cerrada</Badge>
          ) : (
            <Badge>Activa</Badge>
          )
        },
      },
      {
        id: "items",
        header: "Artículos",
        cell: ({ row }) => {
          const s = row.original
          const withdrawn = s.items.filter(
            (i) => i.action === "withdrawn",
          ).length
          return (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Package className="h-4 w-4" />
              {withdrawn}
            </span>
          )
        },
      },
    ],
    [],
  )

  // Use mostly internal state for the table (pagination, sorting, filtering)
  const table = useReactTable({
    data: preFiltered,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: sessionGlobalFilter,
    getRowCanExpand: () => true,
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
        searchPlaceholder="Buscar por usuario, gabinete o artículo..."
      >
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1">
          {SESSION_STATUS_FILTERS.map((b) => (
            <button
              key={b.id}
              onClick={() => handleStatusChange(b.id)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                status === b.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onChange={handleDateRangeChange}
        />
        <span className="ml-auto hidden text-xs text-muted-foreground sm:inline-flex">
          {table.getFilteredRowModel().rows.length} sesión
          {table.getFilteredRowModel().rows.length !== 1 ? "es" : ""}
        </span>
      </DataTableToolbar>

      <DataTable
        table={table}
        columnsLength={columns.length}
        getRowClassName={(row) =>
          cn(
            !row.original.closed_at &&
              "border-l-2 border-l-primary bg-primary/5",
          )
        }
        renderSubComponent={({ row }) => (
          <div className="px-10 py-4">
            {row.original.items.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Sin artículos registrados.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-transparent text-muted-foreground">
                    <th className="pb-2 text-left font-medium">Artículo</th>
                    <th className="pb-2 text-center font-medium">Cant.</th>
                    <th className="pb-2 text-center font-medium">Acción</th>
                    <th className="pb-2 text-right font-medium">Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {row.original.items.map((item) => (
                    <tr key={item.id} className="border-b-0 bg-transparent">
                      <td className="py-2 font-medium text-foreground">
                        {item.item_name ?? "Artículo"}
                      </td>
                      <td className="py-2 text-center text-muted-foreground tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-2 text-center">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            item.action === "withdrawn"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700",
                          )}
                        >
                          {item.action === "withdrawn"
                            ? "Retirado"
                            : "Devuelto"}
                        </span>
                      </td>
                      <td className="py-2 text-right text-muted-foreground tabular-nums">
                        {fmtTime(item.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      />
    </div>
  )
}
