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
import { createCategory, deleteCategory } from "@/lib/actions/categories/manage"
import type { Category } from "@/lib/types/categories"
import { Loader2, Plus, Tags, Trash2 } from "lucide-react"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"

// ─── Create form ──────────────────────────────────────────────────────────────
// Uses useActionState for Zod validation feedback.
// A `formKey` flip remounts the <form> on success, clearing the input.
function CategoryCreateForm() {
  const [state, formAction, isPending] = useActionState(createCategory, {})
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    if (state.success) {
      toast.success("Categoría creada")
      setFormKey((k) => k + 1)
    }
  }, [state.success])

  return (
    <div className="space-y-1">
      <form key={formKey} action={formAction} className="flex gap-2">
        <Input name="name" placeholder="Nueva categoría…" autoComplete="off" />
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </form>
      {state.fieldErrors?.name && (
        <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
      )}
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
    </div>
  )
}

// ─── Delete button ────────────────────────────────────────────────────────────
// Treated as an imperative action — no form state needed.
function CategoryDeleteButton({ id }: { id: string }) {
  const [isPending, setIsPending] = useState(false)

  async function handleDelete() {
    setIsPending(true)
    const result = await deleteCategory(id)
    setIsPending(false)
    if (result.error) toast.error(result.error)
    else toast.success("Categoría eliminada")
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={isPending}
      onClick={handleDelete}
      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </Button>
  )
}

// ─── Dialog ───────────────────────────────────────────────────────────────────
export function CategoryManager({ categories }: { categories: Category[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tags className="mr-1.5 h-4 w-4" />
          Categorías
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Gestionar categorías</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <CategoryCreateForm />

          <ul className="max-h-72 space-y-1 overflow-y-auto">
            {categories.length === 0 && (
              <li className="py-4 text-center text-sm text-muted-foreground">
                No hay categorías todavía.
              </li>
            )}
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-gray-50"
              >
                <span className="text-sm">{cat.name}</span>
                <CategoryDeleteButton id={cat.id} />
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
