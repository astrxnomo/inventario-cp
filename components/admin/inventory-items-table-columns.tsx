"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { PackageIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react"

export type InventoryItem = {
  id: string
  cabinet_id: string
  name: string
  quantity: number
  category_id: string | null
  created_at: string
  updated_at: string
  // Para joins
  cabinet_name?: string
  category_name?: string
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
          <PackageIcon className="size-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cantidad" />
    ),
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number
      const isLow = quantity <= 5
      const Icon = isLow ? AlertTriangleIcon : CheckCircleIcon

      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={isLow ? "destructive" : "default"}
            className="gap-1 font-mono"
          >
            <Icon className="size-3" />
            {quantity}
          </Badge>
        </div>
      )
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
        <Badge variant="outline" className="text-xs">
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
    accessorKey: "cabinet_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gabinete" />
    ),
    cell: ({ row }) => {
      const cabinet = row.getValue("cabinet_name") as string | undefined
      return (
        <div className="text-sm text-muted-foreground">{cabinet || "—"}</div>
      )
    },
    filterFn: (row, id, value) => {
      const cabinet = row.getValue(id) as string | undefined
      return value.includes(cabinet || "Sin gabinete")
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
          {format(date, "d MMM yyyy", { locale: es })}
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
          {format(date, "d MMM yyyy", { locale: es })}
        </div>
      )
    },
  },
]
