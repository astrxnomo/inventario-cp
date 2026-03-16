"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCabinet, updateCabinet } from "@/lib/actions/cabinets/manage"
import type { AdminFormState } from "@/lib/actions/shared"
import type { CabinetAdmin } from "@/lib/types/cabinets"
import { Loader2, Pencil, Plus } from "lucide-react"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"

const initial: AdminFormState = {}

interface Props {
  cabinet?: CabinetAdmin
  trigger?: React.ReactNode
}

// ─── Inner form ───────────────────────────────────────────────────────────────
// Lives inside DialogContent → Radix mounts/unmounts it with the dialog's open
// state, so useActionState resets on every open without any manual cleanup.
function CabinetFormBody({
  cabinet,
  onClose,
}: {
  cabinet?: CabinetAdmin
  onClose: () => void
}) {
  type ActionFn = (s: AdminFormState, f: FormData) => Promise<AdminFormState>
  const action: ActionFn = cabinet
    ? (updateCabinet.bind(null, cabinet.id) as ActionFn)
    : createCabinet
  const [state, formAction, isPending] = useActionState(action, initial)

  useEffect(() => {
    if (state.success) {
      toast.success(cabinet ? "Gabinete actualizado" : "Gabinete creado")
      onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success])

  return (
    <form action={formAction} className="space-y-4 pt-2">
      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="cab-name">Nombre *</Label>
        <Input
          id="cab-name"
          name="name"
          defaultValue={cabinet?.name}
          required
          autoFocus
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cab-description">Descripción</Label>
        <Input
          id="cab-description"
          name="description"
          defaultValue={cabinet?.description ?? ""}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cab-location">Ubicación</Label>
        <Input
          id="cab-location"
          name="location"
          defaultValue={cabinet?.location ?? ""}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {cabinet ? "Guardar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}

// ─── Dialog shell ─────────────────────────────────────────────────────────────
export function CabinetFormDialog({ cabinet, trigger }: Props) {
  const [open, setOpen] = useState(false)

  const defaultTrigger = cabinet ? (
    <Button size="sm" variant="outline" title="Editar gabinete">
      <Pencil className="h-3.5 w-3.5" />
    </Button>
  ) : (
    <Button size="sm">
      <Plus className="mr-1.5 h-4 w-4" />
      Crear gabinete
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {cabinet ? "Editar gabinete" : "Crear gabinete"}
          </DialogTitle>
        </DialogHeader>
        <CabinetFormBody cabinet={cabinet} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
