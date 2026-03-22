"use client"

import { useState } from "react"
import { DataTable } from "@/components/tables/data-table"
import {
  inventoryItemColumns,
  type InventoryItem,
} from "./inventory-items-table-columns"

interface InventoryItemsTableProps {
  items: InventoryItem[]
  categories?: Array<{ label: string; value: string }>
  cabinets?: Array<{ label: string; value: string }>
}

export function InventoryItemsTable({
  items,
  categories = [],
  cabinets = [],
}: InventoryItemsTableProps) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const handleDateRangeChange = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
  }

  // Filtrar por rango de fechas
  const filteredItems = items.filter((item) => {
    if (!dateFrom && !dateTo) return true

    const createdAt = new Date(item.created_at)
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null

    if (from && createdAt < from) return false
    if (to && createdAt > to) return false
    return true
  })

  const filterFields = []

  if (categories.length > 0) {
    filterFields.push({
      id: "category_name" as keyof InventoryItem,
      label: "Categoría",
      options: categories,
    })
  }

  if (cabinets.length > 0) {
    filterFields.push({
      id: "cabinet_name" as keyof InventoryItem,
      label: "Gabinete",
      options: cabinets,
    })
  }

  return (
    <DataTable
      columns={inventoryItemColumns}
      data={filteredItems}
      searchColumn="name"
      searchPlaceholder="Buscar items..."
      filterFields={filterFields}
      showDateFilter
      dateFilterColumn="created_at"
      onDateRangeChange={handleDateRangeChange}
      dateFrom={dateFrom}
      dateTo={dateTo}
      pageSize={20}
    />
  )
}
