"use client"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableToolbar } from "@/components/ui/data-table-toolbar"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { cancelReservation } from "@/lib/actions/reservations/manage"
import type {
    ItemReservation,
    ReservationStatus,
} from "@/lib/types/reservations"
import { cn } from "@/lib/utils"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type FilterFn,
    type PaginationState,
    type SortingState,
    type VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, CalendarClock, Loader2 } from "lucide-react"
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

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

  function handleStatusFilterChange(nextStatus: StatusFilter) {
    setStatusFilter(nextStatus)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  function handleDateRangeChange(from: string, to: string) {
    setDateFrom(from)
    setDateTo(to)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const columns = useMemo<ColumnDef<ItemReservation>[]>(
    () => [
      {
        accessorKey: "item_name",
        header: "Artículo",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-foreground">
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
          <span className="text-foreground">{getValue<string>()}</span>
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
              <span className="text-sm text-muted-foreground tabular-nums">
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
          <span className="text-muted-foreground tabular-nums">
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
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: reservationGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
    },
  })

  if (reservations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card py-10 text-center">
        <CalendarClock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No tienes reservas aún.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <DataTableToolbar
        table={table}
        useGlobalFilter={true}
        searchPlaceholder="Buscar reserva..."
      >
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => handleStatusFilterChange(f.id)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === f.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <DateRangePicker
          from={dateFrom}
          to={dateTo}
          onChange={handleDateRangeChange}
        />
        <span className="ml-auto hidden text-xs text-muted-foreground sm:inline-flex">
          {table.getFilteredRowModel().rows.length} reserva
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </span>
      </DataTableToolbar>

      {/* Table */}
      <DataTable
        table={table}
        columnsLength={columns.length}
        emptyMessage="No se encontraron resultados."
      />
    </div>
  )
}
