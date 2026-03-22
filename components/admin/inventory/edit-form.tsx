"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateItem } from "@/lib/actions/inventory/update-item"
import type { Cabinet } from "@/lib/types/cabinets"
import type { Category } from "@/lib/types/categories"
import type { InventoryItem } from "@/lib/types/inventory"

interface EditItemFormProps {
  item: InventoryItem
  categories: Category[]
  cabinets: Cabinet[]
}

export function EditItemForm({
  item,
  categories,
  cabinets,
}: EditItemFormProps) {
  const router = useRouter()
  const updateItemWithId = updateItem.bind(null, item.id)
  const [state, formAction, isPending] = useActionState(updateItemWithId, {
    success: false,
    error: null,
    fieldErrors: {},
  })
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (state.success) {
      toast.success("Item actualizado correctamente")
      router.push("/admin/inventory")
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, router])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget)
    const errors: Record<string, string> = {}
    const name = formData.get("name") as string
    const quantity = Number(formData.get("quantity"))

    if (!name?.trim()) {
      errors.name = "El nombre es requerido"
    }
    if (isNaN(quantity) || quantity < 0) {
      errors.quantity = "La cantidad debe ser mayor o igual a 0"
    }

    if (Object.keys(errors).length > 0) {
      e.preventDefault()
      setClientErrors(errors)
    } else {
      setClientErrors({})
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-6"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Row 1: Name and Category */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            defaultValue={item.name}
            placeholder="Nombre del item"
            required
          />
          {(state.fieldErrors?.name || clientErrors.name) && (
            <p className="text-sm text-destructive">
              {state.fieldErrors?.name || clientErrors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category_id">Categoría</Label>
          <Select name="category_id" defaultValue={item.category_id || "null"}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">Sin categoría (Unassigned)</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(state.fieldErrors?.category_id || clientErrors.category_id) && (
            <p className="text-sm text-destructive">
              {state.fieldErrors?.category_id || clientErrors.category_id}
            </p>
          )}
        </div>

        {/* Row 2: Quantity and Cabinet */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            defaultValue={item.quantity}
            required
          />
          {(state.fieldErrors?.quantity || clientErrors.quantity) && (
            <p className="text-sm text-destructive">
              {state.fieldErrors?.quantity || clientErrors.quantity}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cabinet_id">Gabinete (Ubicación)</Label>
          <Select name="cabinet_id" defaultValue={item.cabinet_id}>
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

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  )
}
