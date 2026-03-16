"use client"

import { Button } from "@/components/ui/button"
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
  useReactTable,
} from "@tanstack/react-table"
import { Loader2, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

interface ReservationsTableProps {
  reservations: ItemReservation[]
}

const STATUS_TABS = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Activas" },
  { value: "cancelled", label: "Canceladas" },
  { value: "completed", label: "Completadas" },
  { value: "expired", label: "Expiradas" },
] as const

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

function fmt(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const reservationGlobalFilter: FilterFn<ItemReservation> = (
  row,
  _id,
  value: string,
) => {
  const q = value.toLowerCase()
  const r = row.original
  return (
    r.item_name.toLowerCase().includes(q) ||
    r.user_name.toLowerCase().includes(q) ||
    r.cabinet_name.toLowerCase().includes(q)
  )
}

export function ReservationsTable({ reservations }: ReservationsTableProps) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [local, setLocal] = useState(reservations)
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

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
              status: "cancelled" as ReservationStatus,
              cancelled_at: new Date().toISOString(),
              can_cancel: false,
            }
          : row,
      ),
    )
    toast.success("Reserva cancelada")
  }

  const byStatus = useMemo(
    () =>
      statusFilter === "all"
        ? local
        : local.filter((r) => r.status === statusFilter),
    [local, statusFilter],
  )

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
        accessorKey: "user_name",
        header: "Usuario",
        cell: ({ getValue }) => (
          <span className="text-gray-700">{getValue<string>()}</span>
        ),
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
        id: "dates",
        header: "Horario",
        cell: ({ row }) => {
          const r = row.original
          return (
            <div className="flex flex-col gap-0.5 text-xs text-gray-600">
              <span className="whitespace-nowrap tabular-nums">
                Del: {fmt(r.starts_at)}
              </span>
              <span className="whitespace-nowrap tabular-nums">
                Al: {fmt(r.ends_at)}
              </span>
            </div>
          )
        },
      },
      {
        id: "duration",
        header: "Detalles",
        cell: ({ row }) => {
          const r = row.original
          const isGroup = r.group_id !== null
          return (
            <div className="flex flex-col items-start justify-center">
              {isGroup && (
                <span className="mb-0.5 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-sky-600 uppercase">
                  Grupo
                </span>
              )}
              {r.note && (
                <span
                  className="max-w-[150px] truncate text-xs text-muted-foreground italic"
                  title={r.note}
                >
                  &ldquo;{r.note}&rdquo;
                </span>
              )}
            </div>
          )
        },
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
            <Button
              size="sm"
              variant="outline"
              disabled={busyId === r.id}
              onClick={() => handleCancel(r.id)}
            >
              {busyId === r.id ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Cancelando
                </>
              ) : (
                "Cancelar"
              )}
            </Button>
          )
        },
      },
    ],
    [busyId],
  )

  const table = useReactTable({
    data: byStatus,
    columns,
    globalFilterFn: reservationGlobalFilter,
    state: { globalFilter: search },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: 15 },
    },
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar artículo, usuario o gabinete..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white pl-9"
          />
        </div>

        <div className="flex gap-1 self-start rounded-lg border border-gray-200 bg-white p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-gray-100 hover:text-gray-700",
              )}
            >
              {tab.label}
            </button>
          ))}
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
                  Sin reservas para los filtros seleccionados.
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
