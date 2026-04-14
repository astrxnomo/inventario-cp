"use client"

import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import type { Category } from "@/lib/types/categories"
import { ColumnDef } from "@tanstack/react-table"
import { Tag } from "lucide-react"
import { CategoryActions } from "./category-actions"

export const categoryColumns = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      )
    },
    enableSorting: true,
    filterFn: "fuzzy",
  },
  {
    accessorKey: "_count.inventory_items",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Articulos" />
    ),
    cell: ({ row }) => {
      const count = row.original._count?.inventory_items || 0
      return <Badge variant="outline">{count}</Badge>
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <CategoryActions category={row.original} />,
  },
] as ColumnDef<Category>[]
