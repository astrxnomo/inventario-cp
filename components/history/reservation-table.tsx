"use client"

import { useState } from "react"
import { DataTable } from "@/components/tables/data-table"
import {
  reservationColumns,
  reservationStatusOptions,
  type ItemReservation,
} from "./reservation-table-columns"

interface ReservationTableProps {
  reservations: ItemReservation[]
}

export function ReservationTable({ reservations }: ReservationTableProps) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const handleDateRangeChange = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
  }

  // Filtrar por rango de fechas (fecha de inicio de reserva)
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
      columns={reservationColumns}
      data={filteredReservations}
      searchColumn="item_name"
      searchPlaceholder="Buscar por item..."
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
    />
  )
}
