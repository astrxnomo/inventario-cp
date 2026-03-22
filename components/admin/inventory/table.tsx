"use client"

import { DataTable } from "@/components/tables/data-table"
import type { CabinetRow } from "@/lib/types/cabinets"
import type { Category } from "@/lib/types/categories"
import { type DataTableFilterField } from "@/lib/types/data-table"
import { InventoryItem } from "@/lib/types/inventory"
import { useState } from "react"
import { inventoryItemColumns } from "./columns"
import { CreateInventoryDialog } from "./create-dialog"
import { RefreshButton } from "@/components/ui/refresh-button"

interface InventoryItemsTableProps {
  items: InventoryItem[]
  categories?: Category[]
  cabinets?: CabinetRow[]
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

  // Removed "status" filter field
  const filterFields: DataTableFilterField<InventoryItem>[] = []

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: c.name,
  })) // Filter by name as accessor is category_name
  const cabinetOptions = cabinets.map((c) => ({ label: c.name, value: c.name })) // Filter by name as accessor is cabinet_name

  if (categories.length > 0) {
    filterFields.push({
      id: "category_name" as keyof InventoryItem,
      label: "Categoría",
      options: categoryOptions,
    })
  }

  if (cabinets.length > 0) {
    filterFields.push({
      id: "cabinet_name" as keyof InventoryItem,
      label: "Gabinete",
      options: cabinetOptions,
    })
  }

  return (
    <div className="space-y-4">
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
        pageSize={10}
        meta={{ categories, cabinets }}
        actions={
          <div className="flex gap-2">
            <RefreshButton />
            <CreateInventoryDialog
              categories={categories}
              cabinets={cabinets}
            />
          </div>
        }
      />
    </div>
  )
}
