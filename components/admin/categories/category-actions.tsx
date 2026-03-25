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
import { deleteCategory } from "@/lib/actions/categories/delete-category"
import type { Category } from "@/lib/types/categories"
import { Pencil, Trash } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { CategoryForm } from "./form"

export function CategoryActions({ category }: { category: Category }) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, startDelete] = useTransition()

  const handleDelete = () => {
    startDelete(async () => {
      try {
        const result = await deleteCategory(category.id)
        if (result && result.error) {
          toast.error(result.error)
        } else {
          toast.success("Categoría eliminada correctamente")
          setShowDeleteDialog(false)
        }
      } catch (error) {
        toast.error("Error al eliminar la categoría")
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
            <DialogTitle>Editar categoría</DialogTitle>
            <DialogDescription>
              Actualiza los detalles de la categoría.
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            initialData={category}
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
              Esta acción eliminará la categoría &quot;{category.name}&quot;.
              {(category._count?.inventory_items || 0) > 0 && (
                <div className="mt-2 rounded-lg border border-amber-500/50 bg-amber-50 p-3 font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-400">
                  ⚠️ Advertencia: Esta categoría tiene{" "}
                  {category._count?.inventory_items} items asociados. No se
                  podrá eliminar hasta que se muevan o eliminen los items.
                </div>
              )}
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
