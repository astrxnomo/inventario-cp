"use client"

import { useState } from "react"
import { DataTable } from "@/components/tables/data-table"
import {
  userColumns,
  userRoleOptions,
  type UserProfile,
} from "./users-table-columns"

interface UsersTableProps {
  users: UserProfile[]
}

export function UsersTable({ users }: UsersTableProps) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const handleDateRangeChange = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
  }

  // Filtrar por rango de fechas si están definidos
  const filteredUsers = users.filter((user) => {
    if (!dateFrom && !dateTo) return true

    const createdAt = new Date(user.created_at)
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null

    if (from && createdAt < from) return false
    if (to && createdAt > to) return false
    return true
  })

  return (
    <DataTable
      columns={userColumns}
      data={filteredUsers}
      searchColumn="full_name"
      searchPlaceholder="Buscar usuarios..."
      filterFields={[
        {
          id: "role",
          label: "Rol",
          options: userRoleOptions,
        },
      ]}
      showDateFilter
      dateFilterColumn="created_at"
      onDateRangeChange={handleDateRangeChange}
      dateFrom={dateFrom}
      dateTo={dateTo}
      pageSize={10}
    />
  )
}
