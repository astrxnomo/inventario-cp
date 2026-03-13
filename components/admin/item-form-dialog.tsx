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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createItem, updateItem } from "@/lib/actions/items/manage"
import type { AdminFormState } from "@/lib/actions/shared"
import type { CabinetItemAdmin } from "@/lib/types/cabinets"
import type { Category } from "@/lib/types/categories"
import { Loader2, Plus } from "lucide-react"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"

const initial: AdminFormState = {}

interface Props {
  cabinetId: string
  categories: Category[]
  item?: CabinetItemAdmin
  trigger?: React.ReactNode
}

// ─── Inner form ───────────────────────────────────────────────────────────────
// Mounted/unmounted by Radix DialogContent — useActionState resets each open.
// `<Select name="category_id">` leverages Radix's native form integration:
// it renders a hidden <input> that is automatically included in FormData.
function ItemFormBody({
  cabinetId,
  categories,
  item,
  onClose,
}: Omit<Props, "trigger"> & { onClose: () => void }) {
  type ActionFn = (s: AdminFormState, f: FormData) => Promise<AdminFormState>
  const action: ActionFn = item
    ? (updateItem.bind(null, item.id) as ActionFn)
    : (createItem.bind(null, cabinetId) as ActionFn)
  const [state, formAction, isPending] = useActionState(action, initial)

  useEffect(() => {
    if (state.success) {
      toast.success(item ? "Artículo actualizado" : "Artículo creado")
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
        <Label htmlFor="item-name">Nombre *</Label>
        <Input
          id="item-name"
          name="name"
          defaultValue={item?.name}
          required
          autoFocus
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="item-qty">Cantidad *</Label>
        <Input
          id="item-qty"
          name="quantity"
          type="number"
          min="1"
          defaultValue={item?.quantity ?? 1}
          required
        />
        {state.fieldErrors?.quantity && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.quantity}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Categoría *</Label>
        <Select name="category_id" defaultValue={item?.category_id}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.category_id && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.category_id}
          </p>
        )}
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
          {item ? "Guardar" : "Agregar"}
        </Button>
      </div>
    </form>
  )
}

// ─── Dialog shell ─────────────────────────────────────────────────────────────
export function ItemFormDialog({
  cabinetId,
  categories,
  item,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false)

  const defaultTrigger = item ? (
    <Button size="sm" variant="outline">
      Editar
    </Button>
  ) : (
    <Button size="sm">
      <Plus className="mr-1.5 h-4 w-4" />
      Agregar artículo
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? "Editar artículo" : "Agregar artículo"}
          </DialogTitle>
        </DialogHeader>
        <ItemFormBody
          cabinetId={cabinetId}
          categories={categories}
          item={item}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
