"use client"

import { Button } from "@/components/ui/button"

import { authorizeUser } from "@/lib/actions/users/authorize-user"
import { updateUserRole } from "@/lib/actions/users/update-role"

import { Ban, Check, Pencil, ShieldUser } from "lucide-react"
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
  const [,] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [isAuthorizing, startAuthorize] = useTransition()
  const [isRestricting, startRestrict] = useTransition()
  const adminCannotManageTarget =
    currentUserRole === "admin" && ["admin", "root"].includes(user.role)

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

  const handleRestrict = () => {
    startRestrict(async () => {
      try {
        const result = await updateUserRole(user.id, "denied")
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Usuario restringido correctamente")
        }
      } catch (error) {
        toast.error("Error al restringir el usuario")
        console.error(error)
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {user.role === "pending" && (
          <>
            <Button
              size="icon"
              className="h-8 border-emerald-500/20 bg-emerald-500/10 px-2 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400"
              onClick={handleAuthorize}
              disabled={isAuthorizing}
              aria-label="Autorizar"
            >
              <Check />
            </Button>
            <Button
              size="icon"
              className="dark:text-destructive-400 h-8 border-destructive/20 bg-destructive/10 px-2 text-destructive hover:bg-destructive/20"
              onClick={handleRestrict}
              disabled={isRestricting}
              aria-label="Restringir"
            >
              <Ban />
            </Button>
            <hr className="mx-2 h-4 border-l border-muted" />
          </>
        )}
        {["admin", "root"].includes(currentUserRole ?? "") && (
          <Button
            variant="outline"
            size="icon"
            className="h-8 px-2 text-muted-foreground hover:text-primary"
            onClick={handleOpenChangeRole}
            disabled={
              user.id === currentUserId ||
              user.user_id === currentUserId ||
              adminCannotManageTarget
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
        currentUserRole={currentUserRole}
      />
    </>
  )
}
