"use client"

import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
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
        router.push("/admin/categories")
        router.refresh()
      }
    }
  }, [state.success, initialData, onSuccess, isDialog, router])

  const formContent = (
    <>
      {state.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
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
      </div>
    </>
  )

  if (isDialog) {
    return (
      <form action={formAction}>
        {formContent}
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {initialData ? "Guardar cambios" : "Crear categoría"}
          </Button>
        </DialogFooter>
      </form>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      {formContent}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {initialData ? "Guardar cambios" : "Crear categoría"}
        </Button>
      </div>
    </form>
  )
}
