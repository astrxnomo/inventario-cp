"use client"

import { useState } from "react"
import { DataTable } from "@/components/tables/data-table"
import {
  sessionHistoryColumns,
  type HistorySession,
} from "./session-history-table-columns"

interface SessionHistoryTableProps {
  sessions: HistorySession[]
}

export function SessionHistoryTable({ sessions }: SessionHistoryTableProps) {
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
      columns={sessionHistoryColumns}
      data={filteredSessions}
      searchColumn="cabinet_name"
      searchPlaceholder="Buscar por gabinete..."
      showDateFilter
      dateFilterColumn="opened_at"
      onDateRangeChange={handleDateRangeChange}
      dateFrom={dateFrom}
      dateTo={dateTo}
      pageSize={10}
    />
  )
}
