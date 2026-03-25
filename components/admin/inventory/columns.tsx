"use client"

import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import type { CabinetRow } from "@/lib/types/cabinets"
import type { Category } from "@/lib/types/categories"
import { InventoryItem } from "@/lib/types/inventory"
import { formatDate } from "@/lib/utils"
import { ColumnDef, Row, Table } from "@tanstack/react-table"
import { Archive, Box, Tag } from "lucide-react"
import { InventoryActions } from "./inventory-actions"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  table: Table<TData>
}

function DataTableRowActions<TData extends InventoryItem>({
  row,
  table,
}: DataTableRowActionsProps<TData>) {
  const item = row.original

  const meta = table.options.meta as
    | { categories: Category[]; cabinets: CabinetRow[] }
    | undefined
  const categories = meta?.categories || []
  const cabinets = meta?.cabinets || []

  return (
    <InventoryActions item={item} categories={categories} cabinets={cabinets} />
  )
}

export const inventoryItemColumns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Box className="size-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      )
    },
    enableSorting: true,
  },

  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number
      return <Badge variant="outline">{quantity}</Badge>
    },
  },
  {
    accessorKey: "cabinet_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gabinete" />
    ),
    cell: ({ row }) => {
      const cabinet = row.getValue("cabinet_name") as string | undefined
      return (
        <Badge variant="outline">
          <Archive className="size-2" />
          {cabinet || "Sin gabinete"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const cabinet = row.getValue(id) as string | undefined
      return value.includes(cabinet || "Sin gabinete")
    },
  },
  {
    accessorKey: "category_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Categoría" />
    ),
    cell: ({ row }) => {
      const category = row.getValue("category_name") as string | undefined
      return (
        <Badge variant="outline">
          <Tag className="size-2" />
          {category || "Sin categoría"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const category = row.getValue(id) as string | undefined
      return value.includes(category || "Sin categoría")
    },
  },

  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creado" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return (
        <div className="text-sm text-muted-foreground">
          {formatDate(date, "d MMM yyyy")}
        </div>
      )
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actualizado" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("updated_at"))
      return (
        <div className="text-sm text-muted-foreground">
          {formatDate(date, "d MMM yyyy")}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => <DataTableRowActions row={row} table={table} />,
  },
]
