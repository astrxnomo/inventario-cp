"use client"

import { useState } from "react"
import { DataTable } from "@/components/tables/data-table"
import {
  activityLogColumns,
  actionOptions,
  type AccessLog,
} from "./activity-logs-table-columns"

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

  // Filtrar por rango de fechas
  const filteredLogs = logs.filter((log) => {
    if (!dateFrom && !dateTo) return true

    const timestamp = new Date(log.timestamp)
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
      ]}
      showDateFilter
      dateFilterColumn="timestamp"
      onDateRangeChange={handleDateRangeChange}
      dateFrom={dateFrom}
      dateTo={dateTo}
      pageSize={20}
    />
  )
}
