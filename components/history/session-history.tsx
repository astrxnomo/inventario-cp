"use client"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { DataTableToolbar } from "@/components/ui/data-table-toolbar"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { HistorySession } from "@/lib/types/cabinets"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type FilterFn,
    type PaginationState,
    type SortingState,
    type VisibilityState,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, ChevronRight, Package } from "lucide-react"
import { useMemo, useState } from "react"

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const sessionGlobalFilter: FilterFn<HistorySession> = (
  row,
  _id,
  value: string,
) => {
  const q = value.toLowerCase()
  const r = row.original
  return (
    r.cabinet_name.toLowerCase().includes(q) ||
    r.items.some((i) => i.name.toLowerCase().includes(q))
  )
}

export function SessionHistory({ sessions }: { sessions: HistorySession[] }) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([
    { id: "opened_at", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const preFiltered = useMemo(() => {
    return sessions.filter((s) => {
      const d = s.opened_at.slice(0, 10)
      const matchFrom = !dateFrom || d >= dateFrom
      const matchTo = !dateTo || d <= dateTo
      return matchFrom && matchTo
    })
  }, [sessions, dateFrom, dateTo])

  function handleDateRangeChange(from: string, to: string) {
    setDateFrom(from)
    setDateTo(to)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const columns = useMemo<ColumnDef<HistorySession>[]>(
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
        accessorKey: "cabinet_name",
        header: "Gabinete",
        cell: ({ getValue }) => (
          <span className="font-semibold text-foreground">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "opened_at",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Apertura" />
        ),
        cell: ({ row }) => {
          const s = row.original
          return (
            <div className="flex flex-col">
              <span className="whitespace-nowrap text-muted-foreground">
                {formatDate(s.opened_at)}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "closed_at",
        header: "Cierre",
        cell: ({ row }) => {
          const s = row.original
          return s.closed_at ? (
            <span className="whitespace-nowrap text-muted-foreground">
              {formatDate(s.closed_at)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
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

  const table = useReactTable({
    data: preFiltered,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: sessionGlobalFilter,
    getRowCanExpand: (row) => row.original.items.length > 0,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
    },
  })

  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card py-16 text-center">
        <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No tienes sesiones registradas aún.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        useGlobalFilter
        searchPlaceholder="Buscar gabinete o artículo..."
      >
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onChange={handleDateRangeChange}
          />
          <span className="ml-auto hidden text-sm text-muted-foreground sm:inline-flex">
            {table.getFilteredRowModel().rows.length} sesión
            {table.getFilteredRowModel().rows.length !== 1 ? "es" : ""}
          </span>
        </div>
      </DataTableToolbar>

      <DataTable
        table={table}
        columnsLength={columns.length}
        emptyMessage="No se encontraron resultados."
        renderSubComponent={({ row }) => (
          <div className="px-10 py-4">
            {row.original.notes && (
              <p className="mb-3 text-sm text-muted-foreground italic">
                "{row.original.notes}"
              </p>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {(() => {
                const w = row.original.items.filter(
                  (i) => i.action === "withdrawn",
                )
                if (w.length === 0) return null

                return (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Retirados
                    </h4>
                    <ul className="space-y-1">
                      {w.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-1.5 text-sm"
                        >
                          <span className="font-medium text-foreground">
                            {item.name}
                          </span>
                          <span className="text-muted-foreground tabular-nums">
                            ×{item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })()}

              {(() => {
                const r = row.original.items.filter(
                  (i) => i.action === "returned",
                )
                if (r.length === 0) return null

                return (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Devueltos
                    </h4>
                    <ul className="space-y-1">
                      {r.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-1.5 text-sm"
                        >
                          <span className="font-medium text-foreground">
                            {item.name}
                          </span>
                          <span className="text-muted-foreground tabular-nums">
                            ×{item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })()}
            </div>
          </div>
        )}
      />
    </div>
  )
}
