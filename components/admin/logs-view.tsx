"use client"

import { ReservationsTable } from "@/components/admin/reservations-table"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AccessLogEntry, SessionWithItems } from "@/lib/types/logs"
import type { ItemReservation } from "@/lib/types/reservations"
import { cn } from "@/lib/utils"
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
  type SortingState,
} from "@tanstack/react-table"
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Clock,
  Package,
} from "lucide-react"
import * as React from "react"

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

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

// ─── Access log constants ─────────────────────────────────────────────────────

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

// ─── Sessions tab: filtered + paginated list ─────────────────────────────────

const SESSIONS_PAGE_SIZE = 10

type StatusFilter = "all" | "active" | "closed"

const SESSION_STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "active", label: "Activas" },
  { id: "closed", label: "Cerradas" },
]

const sessionGlobalFilter: FilterFn<SessionWithItems> = (
  row,
  _id,
  value: string,
) => {
  const q = value.toLowerCase()
  const s = row.original
  return (
    (s.user_name ?? "").toLowerCase().includes(q) ||
    (s.cabinet_name ?? "").toLowerCase().includes(q) ||
    s.items.some((i) => (i.item_name ?? "").toLowerCase().includes(q))
  )
}

function SessionsPanel({ sessions }: { sessions: SessionWithItems[] }) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "opened_at", desc: true },
  ])

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
                className: "p-1 rounded-sm hover:bg-gray-100",
              }}
              aria-label={
                row.getIsExpanded() ? "Contraer detalles" : "Expandir detalles"
              }
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
        accessorKey: "user_name",
        header: "Usuario",
        cell: ({ row }) => {
          const s = row.original
          return (
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {initials(s.user_name)}
              </span>
              <span className="font-medium text-gray-900">
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
          <span className="text-gray-700">{getValue<string>() ?? "—"}</span>
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

  const table = useReactTable({
    data: preFiltered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: sessionGlobalFilter,
    getRowCanExpand: () => true,
    onGlobalFilterChange: setSearch,
    onSortingChange: setSorting,
    state: {
      globalFilter: search,
      sorting,
    },
    initialState: {
      pagination: { pageSize: SESSIONS_PAGE_SIZE },
    },
  })

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex flex-col gap-2">
        <Input
          placeholder="Buscar por usuario, gabinete o artículo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {SESSION_STATUS_FILTERS.map((b) => (
              <button
                key={b.id}
                onClick={() => setStatus(b.id)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  status === b.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-gray-100",
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onChange={(f, t) => {
              setDateFrom(f)
              setDateTo(t)
            }}
          />
          <span className="ml-auto text-xs text-muted-foreground">
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
                  <TableRow
                    className={cn(
                      !row.original.closed_at &&
                        "border-l-2 border-l-primary bg-primary/5",
                    )}
                  >
                    {row.getVisibleCells().map((c) => (
                      <TableCell key={c.id}>
                        {flexRender(c.column.columnDef.cell, c.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow className="bg-gray-50/50 hover:bg-transparent">
                      <TableCell colSpan={columns.length} className="p-0">
                        <div className="px-10 py-4">
                          {row.original.items.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                              Sin artículos registrados.
                            </p>
                          ) : (
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b bg-transparent text-muted-foreground">
                                  <th className="pb-2 text-left font-medium">
                                    Artículo
                                  </th>
                                  <th className="pb-2 text-center font-medium">
                                    Cant.
                                  </th>
                                  <th className="pb-2 text-center font-medium">
                                    Acción
                                  </th>
                                  <th className="pb-2 text-right font-medium">
                                    Hora
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {row.original.items.map((item) => (
                                  <tr
                                    key={item.id}
                                    className="border-b-0 bg-transparent"
                                  >
                                    <td className="py-2 font-medium text-gray-800">
                                      {item.item_name ?? "Artículo"}
                                    </td>
                                    <td className="py-2 text-center text-gray-600 tabular-nums">
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

// ─── Access logs tab: TanStack Table ─────────────────────────────────────────

const logsGlobalFilter: FilterFn<AccessLogEntry> = (
  row,
  _id,
  value: string,
) => {
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
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-3"
      >
        Fecha <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
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

function AccessLogsPanel({ accessLogs }: { accessLogs: AccessLogEntry[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "created_at", desc: true },
  ])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [actionFilter, setActionFilter] = React.useState<ActionFilter>("all")

  const preFiltered = accessLogs.filter((log) => {
    const d = log.created_at.slice(0, 10)
    const matchFrom = !dateFrom || d >= dateFrom
    const matchTo = !dateTo || d <= dateTo
    const matchAction = actionFilter === "all" || log.action === actionFilter
    return matchFrom && matchTo && matchAction
  })

  const table = useReactTable({
    data: preFiltered,
    columns: ACCESS_LOG_COLUMNS,
    globalFilterFn: logsGlobalFilter,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, globalFilter },
  })

  return (
    <div className="space-y-3">
      {/* toolbar */}
      <div className="flex flex-col gap-2">
        <Input
          placeholder="Buscar por usuario o gabinete..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {ACTION_FILTER_OPTS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActionFilter(opt.id)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  actionFilter === opt.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-gray-100",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <DateRangePicker
            from={dateFrom}
            to={dateTo}
            onChange={(f, t) => {
              setDateFrom(f)
              setDateTo(t)
            }}
          />
          <span className="ml-auto text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} registro
            {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
                  colSpan={ACCESS_LOG_COLUMNS.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Sin registros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {(() => {
            const pi = table.getState().pagination.pageIndex
            const ps = table.getState().pagination.pageSize
            const total = table.getFilteredRowModel().rows.length
            if (total === 0) return "Sin resultados"
            const from = pi * ps + 1
            const to = Math.min((pi + 1) * ps, total)
            return `Página ${pi + 1} de ${Math.max(table.getPageCount(), 1)} · ${from}–${to} de ${total}`
          })()}
        </span>
        <div className="flex gap-2">
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

// ─── Main LogsView ────────────────────────────────────────────────────────────

interface LogsViewProps {
  sessions: SessionWithItems[]
  accessLogs: AccessLogEntry[]
  reservations: ItemReservation[]
}

export function LogsView({
  sessions,
  accessLogs,
  reservations,
}: LogsViewProps) {
  return (
    <Tabs defaultValue="sesiones">
      <TabsList className="mb-4">
        <TabsTrigger value="sesiones">Sesiones ({sessions.length})</TabsTrigger>
        <TabsTrigger value="accesos">Accesos ({accessLogs.length})</TabsTrigger>
        <TabsTrigger value="reservas">
          Reservas ({reservations.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sesiones">
        <SessionsPanel sessions={sessions} />
      </TabsContent>

      <TabsContent value="accesos">
        <AccessLogsPanel accessLogs={accessLogs} />
      </TabsContent>

      <TabsContent value="reservas">
        <ReservationsTable reservations={reservations} />
      </TabsContent>
    </Tabs>
  )
}
