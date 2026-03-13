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
import type { AccessLogEntry, SessionWithItems } from "@/lib/types/logs"
import { cn } from "@/lib/utils"
import {
  flexRender,
  getCoreRowModel,
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

// ─── Session card (accordion) ─────────────────────────────────────────────────

function SessionCard({ session }: { session: SessionWithItems }) {
  const isActive = !session.closed_at
  const [expanded, setExpanded] = React.useState(isActive)
  const dur = duration(session.opened_at, session.closed_at)
  const withdrawn = session.items.filter((i) => i.action === "withdrawn")

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-sm",
        isActive && "border-primary/40 ring-1 ring-primary/10",
      )}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50/80"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {initials(session.user_name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5">
            <span className="text-sm font-semibold text-gray-900">
              {session.user_name ?? "—"}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-600">
              {session.cabinet_name ?? "—"}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span>
              {fmtDate(session.opened_at)} · {fmtTime(session.opened_at)}
            </span>
            {dur && (
              <span className="flex items-center gap-0.5">
                <Clock className="size-3" />
                {dur}
              </span>
            )}
            {withdrawn.length > 0 && (
              <span className="flex items-center gap-0.5">
                <Package className="size-3" />
                {withdrawn.length} artículo{withdrawn.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge
            variant={isActive ? "default" : "secondary"}
            className="text-xs"
          >
            {isActive ? "Activa" : "Cerrada"}
          </Badge>
          {expanded ? (
            <ChevronDown className="size-4 text-gray-400" />
          ) : (
            <ChevronRight className="size-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3">
          {session.items.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Sin artículos registrados.
            </p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="pb-1.5 text-left font-medium">Artículo</th>
                  <th className="pb-1.5 text-center font-medium">Cant.</th>
                  <th className="pb-1.5 text-center font-medium">Acción</th>
                  <th className="pb-1.5 text-right font-medium">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {session.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1.5 font-medium text-gray-800">
                      {item.item_name ?? "Artículo"}
                    </td>
                    <td className="py-1.5 text-center text-gray-600 tabular-nums">
                      {item.quantity}
                    </td>
                    <td className="py-1.5 text-center">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          item.action === "withdrawn"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-green-100 text-green-700",
                        )}
                      >
                        {item.action === "withdrawn" ? "Retirado" : "Devuelto"}
                      </span>
                    </td>
                    <td className="py-1.5 text-right text-muted-foreground tabular-nums">
                      {fmtTime(item.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {session.closed_at && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Cerrada el {fmtFull(session.closed_at)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sessions tab: filtered + paginated list ──────────────────────────────────

const SESSIONS_PAGE_SIZE = 10

type StatusFilter = "all" | "active" | "closed"

const SESSION_STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "active", label: "Activas" },
  { id: "closed", label: "Cerradas" },
]

function SessionsPanel({ sessions }: { sessions: SessionWithItems[] }) {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [page, setPage] = React.useState(0)

  const q = search.toLowerCase()
  const filtered = sessions.filter((s) => {
    const matchSearch =
      !q ||
      (s.user_name ?? "").toLowerCase().includes(q) ||
      (s.cabinet_name ?? "").toLowerCase().includes(q) ||
      s.items.some((i) => (i.item_name ?? "").toLowerCase().includes(q))
    const matchStatus =
      status === "all" ||
      (status === "active" && !s.closed_at) ||
      (status === "closed" && !!s.closed_at)
    const d = s.opened_at.slice(0, 10)
    const matchFrom = !dateFrom || d >= dateFrom
    const matchTo = !dateTo || d <= dateTo
    return matchSearch && matchStatus && matchFrom && matchTo
  })

  // Reset page when filter changes
  React.useEffect(() => {
    setPage(0)
  }, [search, status, dateFrom, dateTo])

  const pageCount = Math.ceil(filtered.length / SESSIONS_PAGE_SIZE)
  const paged = filtered.slice(
    page * SESSIONS_PAGE_SIZE,
    (page + 1) * SESSIONS_PAGE_SIZE,
  )

  return (
    <div className="space-y-3">
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
            {filtered.length} sesión{filtered.length !== 1 ? "es" : ""}
          </span>
        </div>
      </div>

      {/* list */}
      {paged.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-sm text-muted-foreground">
          {sessions.length === 0
            ? "Sin sesiones registradas."
            : "Sin resultados."}
        </div>
      ) : (
        <div className="space-y-2">
          {paged.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}

      {/* pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Página {page + 1} de {pageCount} · {page * SESSIONS_PAGE_SIZE + 1}–
            {page * SESSIONS_PAGE_SIZE + paged.length} de {filtered.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= pageCount - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
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
  const [actionFilter, setActionFilter] =
    React.useState<ActionFilter>("all")

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
}

type Tab = "sesiones" | "accesos"

export function LogsView({ sessions, accessLogs }: LogsViewProps) {
  const [tab, setTab] = React.useState<Tab>("sesiones")

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "sesiones", label: "Sesiones", count: sessions.length },
    { id: "accesos", label: "Accesos", count: accessLogs.length },
  ]

  return (
    <div className="space-y-4">
      {/* tab bar */}
      <div className="flex w-fit gap-1 rounded-lg border border-gray-200 bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-gray-100 hover:text-gray-900",
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0 text-xs",
                tab === t.id ? "bg-white/20" : "bg-gray-100 text-gray-500",
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {tab === "sesiones" && <SessionsPanel sessions={sessions} />}
      {tab === "accesos" && <AccessLogsPanel accessLogs={accessLogs} />}
    </div>
  )
}
