"use client"

import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createInventoryItem } from "@/lib/actions/inventory/create-inventory-item"
import { updateItem } from "@/lib/actions/inventory/update-item"
import type { CabinetRow } from "@/lib/types/cabinets"
import type { Category } from "@/lib/types/categories"
import type { InventoryItem } from "@/lib/types/inventory"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"

interface InventoryFormProps {
  initialData?: Partial<InventoryItem>
  categories: Category[]
  cabinets: CabinetRow[]
  onSuccess?: () => void
  onCancel?: () => void
  isDialog?: boolean
}

export function InventoryForm({
  initialData,
  categories,
  cabinets,
  onSuccess,
  onCancel,
  isDialog,
}: InventoryFormProps) {
  const router = useRouter()

  const updateItemWithId = initialData?.id
    ? updateItem.bind(null, initialData.id)
    : null

  const action =
    initialData?.id && updateItemWithId ? updateItemWithId : createInventoryItem

  const [state, formAction, isPending] = useActionState(action, {
    success: false,
    error: null,
    fieldErrors: {},
  })
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (state.success) {
      toast.success(
        initialData?.id
          ? "Item actualizado correctamente"
          : "Item creado correctamente",
      )
      if (onSuccess) {
        onSuccess()
      } else if (!isDialog) {
        router.push("/admin/inventory")
      }
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, router, onSuccess, isDialog, initialData?.id])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget)
    const errors: Record<string, string> = {}
    const name = formData.get("name") as string
    const quantity = Number(formData.get("quantity"))
    const cabinet_id = formData.get("cabinet_id") as string

    if (!name?.trim()) {
      errors.name = "El nombre es requerido"
    }
    if (isNaN(quantity) || quantity < 0) {
      errors.quantity = "La cantidad debe ser mayor o igual a 0"
    }
    if (!cabinet_id) {
      errors.cabinet_id = "El gabinete es requerido"
    }

    if (Object.keys(errors).length > 0) {
      e.preventDefault()
      setClientErrors(errors)
    } else {
      setClientErrors({})
    }
  }

  const formContent = (
    <>
      {state.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initialData?.name}
            placeholder="Nombre del item"
            required
          />
          {(state.fieldErrors?.name || clientErrors.name) && (
            <p className="text-sm text-destructive">
              {state.fieldErrors?.name || clientErrors.name}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category_id">Categoría</Label>
          <Select
            name="category_id"
            defaultValue={initialData?.category_id || "null"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">Sin categoría</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            defaultValue={initialData?.quantity ?? 0}
            required
          />
          {(state.fieldErrors?.quantity || clientErrors.quantity) && (
            <p className="text-sm text-destructive">
              {state.fieldErrors?.quantity || clientErrors.quantity}
            </p>
          )}
        </div>

        {/* Cabinet */}
        <div className="space-y-2">
          <Label htmlFor="cabinet_id">Gabinete</Label>
          <Select name="cabinet_id" defaultValue={initialData?.cabinet_id}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar gabinete" />
            </SelectTrigger>
            <SelectContent>
              {cabinets.map((cabinet) => (
                <SelectItem key={cabinet.id} value={cabinet.id}>
                  {cabinet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(state.fieldErrors?.cabinet_id || clientErrors.cabinet_id) && (
            <p className="text-sm text-destructive">
              {state.fieldErrors?.cabinet_id || clientErrors.cabinet_id}
            </p>
          )}
        </div>
      </div>
    </>
  )

  if (isDialog) {
    return (
      <form action={formAction} onSubmit={handleSubmit}>
        {formContent}
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {initialData?.id ? "Guardar cambios" : "Crear item"}
          </Button>
        </DialogFooter>
      </form>
    )
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      {formContent}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {initialData?.id ? "Guardar cambios" : "Crear item"}
        </Button>
      </div>
    </form>
  )
}
