"use client"

import { DataTable } from "@/components/tables/data-table"
import { useState } from "react"
import {
  adminReservationColumns,
  reservationStatusOptions,
  type AdminReservation,
} from "./columns"
import { RefreshButton } from "@/components/ui/refresh-button"

interface ReservationsTableProps {
  reservations: AdminReservation[]
}

export function ReservationsTable({ reservations }: ReservationsTableProps) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

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

  return (
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
    />
  )
}
