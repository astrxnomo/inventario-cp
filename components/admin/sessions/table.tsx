"use client"

import { DataTable } from "@/components/tables/data-table"
import { useState } from "react"
import { adminSessionColumns, type AdminSession } from "./columns"
import { RefreshButton } from "@/components/ui/refresh-button"
import { SessionItemsModal } from "./session-items-modal"

interface SessionsTableProps {
  sessions: AdminSession[]
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedSession, setSelectedSession] = useState<AdminSession | null>(
    null,
  )

  const handleDateRangeChange = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
  }

  // Extraer opciones de gabinetes únicos
  const cabinetOptions = Array.from(
    new Set(
      sessions
        .map((session) => session.cabinet_name)
        .filter((name): name is string => Boolean(name)),
    ),
  )
    .sort()
    .map((cabinet) => ({
      label: cabinet,
      value: cabinet,
    }))

  // Extraer opciones de items (por rango)
  const itemsOptions = [
    { label: "Sin items", value: "0" },
    { label: "1-5 items", value: "1-5" },
    { label: "6-10 items", value: "6-10" },
    { label: "11+ items", value: "11+" },
  ]

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
    <>
      <DataTable
        columns={adminSessionColumns(setSelectedSession)}
        data={filteredSessions}
        searchColumn="user_name"
        searchPlaceholder="Buscar por usuario..."
        filterFields={[
          {
            id: "cabinet_name",
            label: "Gabinete",
            options: cabinetOptions,
          },
          {
            id: "items_count",
            label: "Items",
            options: itemsOptions,
          },
        ]}
        showDateFilter
        dateFilterColumn="opened_at"
        onDateRangeChange={handleDateRangeChange}
        dateFrom={dateFrom}
        dateTo={dateTo}
        pageSize={10}
        actions={<RefreshButton />}
      />
      {selectedSession && (
        <SessionItemsModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  )
}
