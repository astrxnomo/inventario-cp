"use client"

import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteCategory } from "@/lib/actions/categories/delete-category"
import type { Category } from "@/lib/types/categories"
import { ColumnDef } from "@tanstack/react-table"
import { Tag } from "lucide-react"
import { useState } from "react"
import { ActionButtonsRow } from "../action-buttons-row"
import { CategoryForm } from "./form"

function CategoryActions({ category }: { category: Category }) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  return (
    <>
      <ActionButtonsRow
        onEdit={() => setShowEditDialog(true)}
        onDelete={() => deleteCategory(category.id)}
        deleteDescription={
          <>
            Esta acción eliminará la categoría "{category.name}".
            {(category._count?.inventory_items || 0) > 0 && (
              <div className="mt-2 rounded-md bg-destructive/15 p-3 font-medium text-destructive">
                ⚠️ Advertencia: Esta categoría tiene{" "}
                {category._count?.inventory_items} items asociados. No se podrá
                eliminar hasta que se muevan o eliminen los items.
              </div>
            )}
          </>
        }
      />
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar categoría</DialogTitle>
          </DialogHeader>
          <CategoryForm
            initialData={category}
            isDialog
            onSuccess={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

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
  },
  {
    accessorKey: "_count.inventory_items",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Objetos" />
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
