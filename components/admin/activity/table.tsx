"use client"

import { DataTable } from "@/components/tables/data-table"
import { useState } from "react"
import { actionOptions, activityLogColumns, type AccessLog } from "./columns"
import { RefreshButton } from "@/components/ui/refresh-button"

interface ActivityLogsTableProps {
  logs: AccessLog[]
}

export function ActivityLogsTable({ logs }: ActivityLogsTableProps) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const handleDateRangeChange = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
  }

  // Extraer opciones de gabinetes únicos
  const cabinetOptions = Array.from(
    new Set(
      logs
        .map((log) => log.cabinet_name)
        .filter((name): name is string => Boolean(name)),
    ),
  )
    .sort()
    .map((cabinet) => ({
      label: cabinet,
      value: cabinet,
    }))

  // Filtrar por rango de fechas
  const filteredLogs = logs.filter((log) => {
    if (!dateFrom && !dateTo) return true

    const timestamp = new Date(log.created_at)
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null

    if (from && timestamp < from) return false
    if (to && timestamp > to) return false
    return true
  })

  return (
    <DataTable
      columns={activityLogColumns}
      data={filteredLogs}
      searchColumn="user_name"
      searchPlaceholder="Buscar por usuario..."
      filterFields={[
        {
          id: "action",
          label: "Acción",
          options: actionOptions,
        },
        {
          id: "cabinet_name",
          label: "Gabinete",
          options: cabinetOptions,
        },
      ]}
      showDateFilter
      dateFilterColumn="created_at"
      onDateRangeChange={handleDateRangeChange}
      dateFrom={dateFrom}
      dateTo={dateTo}
      pageSize={10}
      actions={<RefreshButton />}
    />
  )
}
