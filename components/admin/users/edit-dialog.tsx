"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { updateUser } from "@/lib/actions/users/update-user"
import { toast } from "sonner"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { id: string; full_name?: string | null; email?: string }
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
}: EditUserDialogProps) {
  const [name, setName] = useState(user.full_name || "")
  const [email, setEmail] = useState(user.email || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    const res = await updateUser(user.id, { full_name: name, email })
    setIsSaving(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Usuario actualizado")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar {user.full_name || user.email}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
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
