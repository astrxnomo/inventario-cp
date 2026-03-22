"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCategory } from "@/lib/actions/categories/create-category"
import { updateCategory } from "@/lib/actions/categories/update-category"
import type { AdminFormState } from "@/lib/actions/shared"
import type { Category } from "@/lib/types/categories"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"

interface CategoryFormProps {
  initialData?: Category
  onSuccess?: () => void
  onCancel?: () => void
  isDialog?: boolean
}

export function CategoryForm({
  initialData,
  onSuccess,
  onCancel,
  isDialog = false,
}: CategoryFormProps) {
  const router = useRouter()

  const updateAction = initialData
    ? updateCategory.bind(null, initialData.id)
    : null

  // We cast the action to any because TypeScript has trouble unifying the signatures
  // even though they are compatible for useActionState
  const action = (initialData ? updateAction : createCategory) as any

  const [state, formAction, isPending] = useActionState<AdminFormState>(
    action,
    {},
  )

  useEffect(() => {
    if (state.success) {
      toast.success(initialData ? "Categoría actualizada" : "Categoría creada")
      if (onSuccess) {
        onSuccess()
      } else if (!isDialog) {
        // Redirect back to list if not in dialog
        router.push("/admin/categories")
        router.refresh()
      }
    }
  }, [state.success, initialData, onSuccess, isDialog, router])

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          defaultValue={initialData?.name}
          placeholder="Ej: Herramientas manuales"
          required
        />
        {state.fieldErrors?.name && (
          <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {isDialog && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {initialData ? "Guardar cambios" : "Crear categoría"}
        </Button>
      </div>
    </form>
  )
}
