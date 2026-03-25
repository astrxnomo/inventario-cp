"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { deleteItem } from "@/lib/actions/inventory/delete-item"
import type { CabinetRow } from "@/lib/types/cabinets"
import type { Category } from "@/lib/types/categories"
import type { InventoryItem } from "@/lib/types/inventory"
import { Pencil, Trash } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { InventoryForm } from "./form"

export function InventoryActions({
  item,
  categories,
  cabinets,
}: {
  item: InventoryItem
  categories: Category[]
  cabinets: CabinetRow[]
}) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, startDelete] = useTransition()

  const handleDelete = () => {
    startDelete(async () => {
      try {
        const result = await deleteItem(item.id)
        if (result && result.error) {
          toast.error(result.error)
        } else {
          toast.success("Item eliminado correctamente")
          setShowDeleteDialog(false)
        }
      } catch (error) {
        toast.error("Error al eliminar el item")
        console.error(error)
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 px-2 text-muted-foreground hover:text-primary"
          onClick={() => setShowEditDialog(true)}
          aria-label="Editar"
        >
          <Pencil />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 px-2 text-muted-foreground hover:text-destructive"
          onClick={() => setShowDeleteDialog(true)}
          aria-label="Eliminar"
        >
          <Trash />
        </Button>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar item</DialogTitle>
            <DialogDescription>
              Actualiza los detalles del artículo.
            </DialogDescription>
          </DialogHeader>
          <InventoryForm
            initialData={item}
            categories={categories}
            cabinets={cabinets}
            isDialog
            onSuccess={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminará permanentemente el
              item &quot;{item.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
