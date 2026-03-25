"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { updateUserRole } from "@/lib/actions/users/update-role"
import { toast } from "sonner"

import type { UserProfile } from "./columns"

interface ChangeRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserProfile
}

export function ChangeRoleDialog({
  open,
  onOpenChange,
  user,
}: ChangeRoleDialogProps) {
  const [role, setRole] = useState<string>(user.role)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (role === user.role) {
      onOpenChange(false)
      return
    }

    setIsSaving(true)
    const res = await updateUserRole(user.id, role)
    setIsSaving(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Rol actualizado correctamente")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Cambiar rol de {user.full_name || user.email}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Select
              value={role}
              onValueChange={(v) => setRole(v)}
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Usuario</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
