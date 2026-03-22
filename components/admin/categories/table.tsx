"use client"

import { DataTable } from "@/components/tables/data-table"
import { RefreshButton } from "@/components/ui/refresh-button"
import type { Category } from "@/lib/types/categories"
import { categoryColumns } from "./columns"
import { CategoryFormDialog } from "./dialog"

interface CategoriesTableProps {
  data: Category[]
}

export function CategoriesTable({ data }: CategoriesTableProps) {
  return (
    <div className="space-y-4">
      <DataTable
        columns={categoryColumns}
        data={data}
        searchColumn="name"
        searchPlaceholder="Buscar categorías..."
        filterFields={[]} // No filters for now
        actions={
          <div className="flex gap-2">
            <RefreshButton />
            <CategoryFormDialog />
          </div>
        }
      />
    </div>
  )
}
