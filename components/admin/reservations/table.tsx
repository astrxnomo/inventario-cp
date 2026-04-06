"use client"

import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DataTable } from "@/components/tables/data-table"
import { cancelReservation } from "@/lib/actions/reservations/cancel-reservation"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import {
  adminReservationColumns,
  reservationStatusOptions,
  type AdminReservation,
} from "./columns"
import { RefreshButton } from "@/components/ui/refresh-button"
import { toast } from "sonner"

interface ReservationsTableProps {
  reservations: AdminReservation[]
}

export function ReservationsTable({ reservations }: ReservationsTableProps) {
  const router = useRouter()
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [reservationToCancel, setReservationToCancel] =
    useState<AdminReservation | null>(null)
  const [isCancelling, startCancelling] = useTransition()

  const handleDateRangeChange = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
  }

  // Filtrar por rango de fechas
  const filteredReservations = reservations.filter((reservation) => {
    if (!dateFrom && !dateTo) return true

    const startsAt = new Date(reservation.starts_at)
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null

    if (from && startsAt < from) return false
    if (to && startsAt > to) return false
    return true
  })

  const handleCancel = () => {
    if (!reservationToCancel) return

    startCancelling(async () => {
      try {
        const result = await cancelReservation(reservationToCancel.id)
        if (result.error) {
          toast.error(result.error)
          return
        }

        toast.success("Reserva cancelada correctamente")
        setReservationToCancel(null)
        router.refresh()
      } catch (error) {
        console.error(error)
        toast.error("No se pudo cancelar la reserva")
      }
    })
  }

  return (
    <>
      <DataTable
        columns={adminReservationColumns}
        data={filteredReservations}
        searchColumn="user_name"
        searchPlaceholder="Buscar por usuario..."
        filterFields={[
          {
            id: "status",
            label: "Estado",
            options: reservationStatusOptions,
          },
        ]}
        showDateFilter
        dateFilterColumn="starts_at"
        onDateRangeChange={handleDateRangeChange}
        dateFrom={dateFrom}
        dateTo={dateTo}
        pageSize={10}
        actions={<RefreshButton />}
        meta={{
          onCancel: (reservation: AdminReservation) =>
            setReservationToCancel(reservation),
        }}
      />

      <ConfirmDialog
        open={!!reservationToCancel}
        onOpenChange={(open) => !open && setReservationToCancel(null)}
        title="Cancelar reserva"
        description={
          reservationToCancel
            ? `Se cancelara la reserva de ${reservationToCancel.item_name ?? "este articulo"}. Esta accion no se puede deshacer.`
            : undefined
        }
        confirmLabel="Si, cancelar"
        cancelLabel="Mantener"
        intent="destructive"
        isLoading={isCancelling}
        onConfirm={handleCancel}
      />
    </>
  )
}
