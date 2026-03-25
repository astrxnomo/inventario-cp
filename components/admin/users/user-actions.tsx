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
import { authorizeUser } from "@/lib/actions/users/authorize-user"
import { deleteUser } from "@/lib/actions/users/delete-user"
import { Check, Pencil, ShieldUser, Trash } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { ChangeRoleDialog } from "./change-role-dialog"
import { EditUserDialog } from "./edit-dialog"
import type { UserProfile } from "./columns"

export function UserActions({
  user,
  currentUserRole,
  currentUserId,
}: {
  user: UserProfile
  currentUserRole?: string
  currentUserId?: string
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [isDeleting, startDelete] = useTransition()
  const [isAuthorizing, startAuthorize] = useTransition()

  const handleDelete = () => {
    startDelete(async () => {
      try {
        const result = await deleteUser(user.id)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Usuario eliminado correctamente")
          setShowDeleteDialog(false)
        }
      } catch (error) {
        toast.error("Error al eliminar el usuario")
        console.error(error)
      }
    })
  }

  const handleAuthorize = () => {
    startAuthorize(async () => {
      try {
        const result = await authorizeUser(user.id)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Usuario autorizado correctamente")
        }
      } catch (error) {
        toast.error("Error al autorizar el usuario")
        console.error(error)
      }
    })
  }

  const handleOpenChangeRole = () => {
    if (user.id === currentUserId || user.user_id === currentUserId) {
      toast.error("No puedes cambiar tu propio rol")
      return
    }
    setShowRoleDialog(true)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {user.role === "pending" && (
          <>
            <Button
              size="icon"
              className="h-8 border-emerald-500/20 bg-emerald-500/10 px-2 text-emerald-700 text-muted-foreground hover:bg-emerald-500/20 dark:text-emerald-400"
              onClick={handleAuthorize}
              disabled={isAuthorizing}
              aria-label="Autorizar"
            >
              <Check />
            </Button>
            <hr className="mx-2 h-4 border-l border-muted" />
          </>
        )}
        {currentUserRole === "root" && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 px-2 text-muted-foreground hover:text-primary"
            onClick={handleOpenChangeRole}
            disabled={
              user.id === currentUserId || user.user_id === currentUserId
            }
            aria-label="Cambiar rol"
          >
            <ShieldUser />
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-primary"
          onClick={() => setShowEditDialog(true)}
          aria-label="Editar"
        >
          <Pencil />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-destructive"
          onClick={() => setShowDeleteDialog(true)}
          aria-label="Eliminar"
        >
          <Trash />
        </Button>
      </div>

      <EditUserDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        user={user}
      />

      <ChangeRoleDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        user={user}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al usuario &quot;
              {user.full_name || user.email}
              &quot;. Si el usuario tiene registros asociados, la eliminación
              podría fallar.
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
