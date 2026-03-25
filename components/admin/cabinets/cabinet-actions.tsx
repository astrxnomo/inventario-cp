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
import { deleteCabinet } from "@/lib/actions/cabinets/delete-cabinet"
import { setCabinetStatus } from "@/lib/actions/cabinets/set-cabinet-status"
import type { Cabinet } from "@/lib/types/cabinets"
import { AlertOctagon, Pencil, Trash, Lock, Unlock } from "lucide-react"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { CabinetForm } from "./form"

export function CabinetActions({ cabinet }: { cabinet: Cabinet }) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, startDelete] = useTransition()
  const [isChanging, startChange] = useTransition()

  const handleDelete = () => {
    startDelete(async () => {
      try {
        const result = await deleteCabinet(cabinet.id)
        if (result && result.error) {
          toast.error(result.error)
        } else {
          toast.success("Gabinete eliminado correctamente")
          setShowDeleteDialog(false)
        }
      } catch (error) {
        toast.error("Error al eliminar el gabinete")
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
        <Button
          variant="outline"
          size="icon"
          className="h-8 px-2 text-muted-foreground hover:text-destructive"
          onClick={() => setShowDeleteDialog(true)}
          aria-label="Eliminar"
        >
          <Trash />
        </Button>

        {/* Toggle lock/unlock button */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
          onClick={() =>
            startChange(async () => {
              try {
                const target =
                  cabinet.status === "locked" ? "available" : "locked"
                const res = await setCabinetStatus(
                  cabinet.id,
                  target as "available" | "in_use" | "locked",
                )
                if (res && res.error) {
                  toast.error(res.error)
                } else {
                  toast.success(
                    target === "locked"
                      ? "Gabinete bloqueado"
                      : "Gabinete desbloqueado",
                  )
                }
              } catch (e) {
                toast.error("Error al cambiar estado del gabinete")
                console.error(e)
              }
            })
          }
          disabled={isChanging}
          aria-label={cabinet.status === "locked" ? "Desbloquear" : "Bloquear"}
        >
          {cabinet.status === "locked" ? <Unlock /> : <Lock />}
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              <span>
                Esta acción no se puede deshacer. Eliminará el gabinete &quot;
                {cabinet.name}&quot; y todos sus datos asociados.
              </span>
              {(cabinet._count?.inventory_items || 0) > 0 && (
                <div className="mt-2 flex rounded-lg border border-amber-500/50 bg-amber-50 p-3 font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-400">
                  <AlertOctagon />
                  <span className="ml-2">
                    Este gabinete contiene {cabinet._count?.inventory_items}{" "}
                    items.
                  </span>
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
