"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCabinet } from "@/lib/actions/cabinets/create-cabinet"
import { updateCabinet } from "@/lib/actions/cabinets/update-cabinet"
import { type AdminFormState } from "@/lib/actions/shared"
import { Loader2 } from "lucide-react"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"

interface CabinetFormProps {
  initialData?: {
    id: string
    name: string
    description?: string | null
    location?: string | null
  }
  onSuccess?: () => void
  onCancel?: () => void
  isDialog?: boolean
}

export function CabinetForm({
  initialData,
  onSuccess,
  onCancel,
  isDialog = false,
}: CabinetFormProps) {
  const updateAction = initialData?.id
    ? updateCabinet.bind(null, initialData.id)
    : null

  const action = (initialData?.id ? updateAction : createCabinet) as any

  const [state, formAction, isPending] = useActionState<AdminFormState>(
    action,
    {
      success: false,
      error: null,
      fieldErrors: {},
    },
  )

  useEffect(() => {
    if (state.success) {
      toast.success(
        initialData?.id ? "Gabinete actualizado" : "Gabinete creado",
      )
      if (onSuccess) {
        onSuccess()
      }
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, onSuccess, initialData])

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name}
          placeholder="Nombre del gabinete"
          required
        />
        {state.fieldErrors?.name && (
          <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Ubicación</Label>
        <Input
          id="location"
          name="location"
          defaultValue={initialData?.location || ""}
          placeholder="Ej: Edificio A, Piso 2"
        />
        {state.fieldErrors?.location && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.location}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={initialData?.description || ""}
          placeholder="Detalles adicionales..."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        {state.fieldErrors?.description && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.description}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {initialData?.id ? "Guardar Cambios" : "Crear Gabinete"}
        </Button>
      </div>
    </form>
  )
}
