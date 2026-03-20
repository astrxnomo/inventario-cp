"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DataTableToolbar } from "@/components/ui/data-table-toolbar"
import { cancelReservation } from "@/lib/actions/reservations/manage"
import type {
  ItemReservation,
  ReservationStatus,
} from "@/lib/types/reservations"
import { cn } from "@/lib/utils"
import {
  type ColumnDef,
  type FilterFn,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Loader2 } from "lucide-react"
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
  const map: Record<
    ReservationStatus,
    {
      label: string
      variant: "default" | "secondary" | "destructive" | "outline"
    }
  > = {
    active: { label: "Activa", variant: "default" },
    cancelled: { label: "Cancelada", variant: "destructive" },
    completed: { label: "Completada", variant: "secondary" },
    expired: { label: "Expirada", variant: "outline" },
  }
  const { label, variant } = map[status] ?? {
    label: status,
    variant: "outline",
  }
  return (
    <Badge variant={variant} className="px-2 py-1 text-xs">
      {label}
    </Badge>
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
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  })

  function handleStatusFilterChange(nextStatus: string) {
    setStatusFilter(nextStatus)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

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
        accessorKey: "user_name",
        header: "Usuario",
        cell: ({ getValue }) => (
          <span className="text-foreground">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Cant.",
        cell: ({ getValue }) => (
          <span className="text-foreground tabular-nums">
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
            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
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
          return (
            <div className="flex flex-col items-start justify-center">
              {r.note && (
                <span
                  className="max-w-37.5 truncate text-xs text-muted-foreground italic"
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
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      globalFilter,
      pagination,
    },
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <DataTableToolbar
        table={table}
        useGlobalFilter={true}
        searchPlaceholder="Buscar artículo, usuario o gabinete..."
      >
        <div className="flex flex-wrap gap-1 self-start rounded-lg border border-border bg-muted/30 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusFilterChange(tab.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </DataTableToolbar>

      {/* Table */}
      <DataTable
        table={table}
        columnsLength={columns.length}
        emptyMessage="Sin reservas para los filtros seleccionados."
      />
    </div>
  )
}
