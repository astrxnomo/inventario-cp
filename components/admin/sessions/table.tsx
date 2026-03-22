"use client"

import { DataTable } from "@/components/tables/data-table"
import { useState } from "react"
import { adminSessionColumns, type AdminSession } from "./columns"
import { RefreshButton } from "@/components/ui/refresh-button"

interface SessionsTableProps {
  sessions: AdminSession[]
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const handleDateRangeChange = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
  }

  // Filtrar por rango de fechas
  const filteredSessions = sessions.filter((session) => {
    if (!dateFrom && !dateTo) return true

    const openedAt = new Date(session.opened_at)
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null

    if (from && openedAt < from) return false
    if (to && openedAt > to) return false
    return true
  })

  return (
    <DataTable
      columns={adminSessionColumns}
      data={filteredSessions}
      searchColumn="user_name"
      searchPlaceholder="Buscar por usuario..."
      showDateFilter
      dateFilterColumn="opened_at"
      onDateRangeChange={handleDateRangeChange}
      dateFrom={dateFrom}
      dateTo={dateTo}
      pageSize={10}
      actions={<RefreshButton />}
    />
  )
}
