"use client"

import { DataTable } from "@/components/tables/data-table"
import { RefreshButton } from "@/components/ui/refresh-button"
import { useState } from "react"
import { adminSessionColumns, type AdminSession } from "./columns"
import type { ColumnDef } from "@tanstack/react-table"
import { SessionTimeline } from "./timeline"

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

  // Extraer opciones de items por nombre (para filtrar por item específico)
  const itemNameOptions = Array.from(
    new Set(
      sessions
        .flatMap((s) => s.items ?? [])
        .map((it) => it.name)
        .filter((n): n is string => Boolean(n)),
    ),
  )
    .sort()
    .map((name) => ({ label: name, value: name }))

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

  // Construir columnas agregando una columna oculta `items` con filtro personalizado
  const columns: ColumnDef<AdminSession, any>[] =
    adminSessionColumns(setSelectedSession)

  columns.push({
    id: "items",
    accessorKey: "items",
    header: () => null,
    cell: () => null,
    enableHiding: true,
    // filterValue expected to be an array of selected item names
    filterFn: (row, _columnId, filterValue) => {
      if (
        !filterValue ||
        (Array.isArray(filterValue) && filterValue.length === 0)
      )
        return true
      const items = row.original.items
      if (!items || items.length === 0) return false
      const selected = Array.isArray(filterValue) ? filterValue : [filterValue]
      return items.some((it) => selected.includes(it.name))
    },
  })

  return (
    <>
      <DataTable
        columns={columns}
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
            id: "items",
            label: "Articulo",
            options: itemNameOptions,
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
      <SessionTimeline
        session={selectedSession}
        open={!!selectedSession}
        onOpenChange={(open) => !open && setSelectedSession(null)}
      />
    </>
  )
}
