"use client"

import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteCabinet } from "@/lib/actions/cabinets/delete-cabinet"
import type { Cabinet } from "@/lib/types/cabinets"
import { formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { AlertTriangle, Archive, Check, Lock } from "lucide-react"
import { useState } from "react"
import { ActionButtonsRow } from "../action-buttons-row"
import { CabinetForm } from "./form"

export const statusOptions = [
  {
    label: "Disponible",
    value: "available",
    icon: Check,
  },
  {
    label: "En uso",
    value: "in_use",
    icon: AlertTriangle,
  },
  {
    label: "Bloqueado",
    value: "locked",
    icon: Lock,
  },
]

function CabinetActions({ cabinet }: { cabinet: Cabinet }) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  return (
    <>
      <ActionButtonsRow
        onEdit={() => setShowEditDialog(true)}
        onDelete={() => deleteCabinet(cabinet.id)}
        deleteDescription={
          <>
            Esta acción no se puede deshacer. Eliminará el gabinete "
            {cabinet.name}" y todos sus datos asociados.
            {(cabinet._count?.inventory_items || 0) > 0 && (
              <div className="mt-2 rounded-lg border border-amber-500/50 bg-amber-50 p-3 font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-400">
                ⚠️ Advertencia: Este gabinete contiene items.
              </div>
            )}
          </>
        }
      />
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar gabinete</DialogTitle>
            <DialogDescription>
              Actualiza los detalles del gabinete.
            </DialogDescription>
          </DialogHeader>
          <CabinetForm
            initialData={cabinet}
            isDialog
            onSuccess={() => setShowEditDialog(false)}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export const cabinetColumns: ColumnDef<Cabinet>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Archive className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ubicación" />
    ),
    cell: ({ row }) => {
      const location = row.getValue("location") as string | null
      return <Badge variant="outline">{location || "Sin ubicación"}</Badge>
    },
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      if (status === "available") {
        return (
          <Badge
            variant="outline"
            className="border-green-500/20 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-400"
          >
            <Check className="mr-1 h-3 w-3" />
            Disponible
          </Badge>
        )
      }

      if (status === "in_use") {
        return (
          <Badge
            variant="outline"
            className="border-amber-500/20 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400"
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
            En uso
          </Badge>
        )
      }

      if (status === "locked") {
        return (
          <Badge
            variant="outline"
            className="border-red-500/20 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-400"
          >
            <Lock className="mr-1 h-3 w-3" />
            Bloqueado
          </Badge>
        )
      }

      return <Badge variant="outline">{status}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
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
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Creado" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return (
        <span className="text-muted-foreground">
          {formatDate(date, "d MMM yyyy")}
        </span>
      )
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <CabinetActions cabinet={row.original} />,
  },
]
