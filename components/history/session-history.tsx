"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { HistorySession } from "@/lib/types/cabinets"
import {
    type ColumnDef,
    type FilterFn,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    ArrowUpDown,
    ChevronDown,
    ChevronRight,
    Package,
    Search
} from "lucide-react"
import React, { useMemo, useState } from "react"

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
  const [search, setSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sorting, setSorting] = useState<SortingState>([
    { id: "opened_at", desc: true },
  ])

  const preFiltered = useMemo(() => {
    return sessions.filter((s) => {
      const d = s.opened_at.slice(0, 10)
      const matchFrom = !dateFrom || d >= dateFrom
      const matchTo = !dateTo || d <= dateTo
      return matchFrom && matchTo
    })
  }, [sessions, dateFrom, dateTo])

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
                className: "p-1 rounded-sm hover:bg-gray-100",
              }}
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
          ) : null
        },
      },
      {
        accessorKey: "cabinet_name",
        header: "Gabinete",
        cell: ({ getValue }) => (
          <span className="font-semibold text-gray-900">
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "opened_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Apertura <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
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
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: sessionGlobalFilter,
    getRowCanExpand: (row) => row.original.items.length > 0,
    onGlobalFilterChange: setSearch,
    onSortingChange: setSorting,
    state: {
      globalFilter: search,
      sorting,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  if (sessions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
        <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm text-muted-foreground">
          No tienes sesiones registradas aún.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex flex-col gap-2">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar gabinete o artículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onChange={(f, t) => {
              setDateFrom(f)
              setDateTo(t)
            }}
          />
          <span className="ml-auto text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} sesión
            {table.getFilteredRowModel().rows.length !== 1 ? "es" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow>
                    {row.getVisibleCells().map((c) => (
                      <TableCell key={c.id}>
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={columns.length}
                        className="bg-gray-50/50 p-0"
                      >
                        <div className="px-10 py-4">
                          {row.original.notes && (
                            <p className="mb-3 text-sm text-muted-foreground italic">
                              "{row.original.notes}"
                            </p>
                          )}
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Withdrawn */}
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
                                        className="flex items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-1.5 text-sm"
                                      >
                                        <span className="font-medium text-gray-800">
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
                            {/* Returned */}
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
                                        className="flex items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-1.5 text-sm"
                                      >
                                        <span className="font-medium text-gray-800">
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
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount() || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
