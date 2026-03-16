"use client"

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
import { cancelReservation } from "@/lib/actions/reservations/manage"
import type {
    ItemReservation,
    ReservationStatus,
} from "@/lib/types/reservations"
import { cn } from "@/lib/utils"
import {
    type ColumnDef,
    type FilterFn,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table"
import {
    ArrowUpDown,
    CalendarClock,
    Loader2,
    Search
} from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

function fmtRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  return `${s.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })} – ${e.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  const map: Record<ReservationStatus, { label: string; className: string }> = {
    active: { label: "Activa", className: "bg-emerald-100 text-emerald-700" },
    cancelled: { label: "Cancelada", className: "bg-red-100 text-red-600" },
    completed: { label: "Completada", className: "bg-sky-100 text-sky-700" },
    expired: { label: "Expirada", className: "bg-gray-100 text-gray-500" },
  }
  const { label, className } = map[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-500",
  }
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

type StatusFilter = "all" | ReservationStatus

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "active", label: "Activas" },
  { id: "cancelled", label: "Canceladas" },
  { id: "completed", label: "Completadas" },
  { id: "expired", label: "Expiradas" },
]

const reservationGlobalFilter: FilterFn<ItemReservation> = (
  row,
  _id,
  value: string,
) => {
  const q = value.toLowerCase()
  const r = row.original
  return (
    r.item_name.toLowerCase().includes(q) ||
    r.cabinet_name.toLowerCase().includes(q) ||
    (r.note ?? "").toLowerCase().includes(q)
  )
}

export function MyReservations({
  reservations,
}: {
  reservations: ItemReservation[]
}) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [local, setLocal] = useState(reservations)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sorting, setSorting] = useState<SortingState>([
    { id: "starts_at", desc: true },
  ])

  async function handleCancel(id: string) {
    setBusyId(id)
    const result = await cancelReservation(id)
    setBusyId(null)

    if (result.error) {
      toast.error(result.error)
      return
    }

    setLocal((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              status: "cancelled",
              cancelled_at: new Date().toISOString(),
              can_cancel: false,
            }
          : row,
      ),
    )
    toast.success("Reserva cancelada")
  }

  const byFilters = useMemo(() => {
    return local.filter((r) => {
      const matchStatus = statusFilter === "all" || r.status === statusFilter
      const d = r.starts_at.slice(0, 10)
      const matchFrom = !dateFrom || d >= dateFrom
      const matchTo = !dateTo || d <= dateTo
      return matchStatus && matchFrom && matchTo
    })
  }, [local, statusFilter, dateFrom, dateTo])

  const columns = useMemo<ColumnDef<ItemReservation>[]>(
    () => [
      {
        accessorKey: "item_name",
        header: "Artículo",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-gray-900">
              {row.original.item_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {row.original.item_category}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "cabinet_name",
        header: "Gabinete",
        cell: ({ getValue }) => (
          <span className="text-gray-700">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "starts_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-3"
          >
            Horario <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const r = row.original
          return (
            <div className="flex flex-col">
              <span className="text-sm text-gray-700 tabular-nums">
                {fmtRange(r.starts_at, r.ends_at)}
              </span>
              {r.note && (
                <span className="text-xs text-muted-foreground italic">
                  Nota: {r.note}
                </span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "quantity",
        header: "Cant.",
        cell: ({ getValue }) => (
          <span className="text-gray-700 tabular-nums">
            {getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const r = row.original
          if (!r.can_cancel) return null
          return (
            <div className="text-right">
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === r.id}
                onClick={() => handleCancel(r.id)}
              >
                {busyId === r.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Cancelar"
                )}
              </Button>
            </div>
          )
        },
      },
    ],
    [busyId],
  )

  const table = useReactTable({
    data: byFilters,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: reservationGlobalFilter,
    onGlobalFilterChange: setSearch,
    onSortingChange: setSorting,
    state: {
      globalFilter: search,
      sorting,
    },
    initialState: {
      pagination: { pageSize: 8 },
    },
  })

  if (reservations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white py-10 text-center">
        <CalendarClock className="mx-auto mb-2 h-8 w-8 text-gray-300" />
        <p className="text-sm text-muted-foreground">No tienes reservas aún.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar reserva..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  statusFilter === f.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-gray-100",
                )}
              >
                {f.label}
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
            {table.getFilteredRowModel().rows.length} reserva
            {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((c) => (
                    <TableCell key={c.id}>
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
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
