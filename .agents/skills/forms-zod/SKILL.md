# Skill: forms-zod

## Purpose
Defines how forms are built and validated in this project using Zod schemas and Next.js `useActionState`.

---

## Schema Location

All Zod schemas live in `lib/schemas/<domain>.ts`:

```
lib/schemas/
├── auth.ts
├── cabinets.ts
├── categories.ts
├── inventory.ts
├── reservations.ts
└── users.ts
```

---

## Schema Definition Pattern

```ts
// lib/schemas/inventory.ts
import { z } from "zod"

export const inventoryItemSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  quantity: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "La cantidad debe ser al menos 1"),
  category_id: z.string().min(1, "La categoría es requerida"),
})

export type InventoryItemInput = z.infer<typeof inventoryItemSchema>
```

### Common Zod patterns used

| Pattern | Example |
|---|---|
| Required string | `z.string().min(1, "El campo es requerido")` |
| Optional string | `z.string().optional()` |
| Coerce number from FormData | `z.coerce.number().int().min(1, "…")` |
| UUID validation | `z.string().uuid("ID inválido")` |
| Datetime string | `z.string().datetime("Fecha inválida")` |
| Enum | `z.enum(["active", "cancelled", "completed", "expired"])` |
| Nullable | `z.string().nullable()` |
| Max length | `z.string().max(500, "No puede superar 500 caracteres")` |
| Cross-field validation | `.superRefine((val, ctx) => { ... ctx.addIssue({...}) })` |
| Optional with fallback in FormData | `formData.get("field") \|\| undefined` |

---

## Server Action Validation

In the Server Action, parse `FormData` with `safeParse` and return field errors if invalid:

```ts
"use server"
import { collectFieldErrors, type AdminFormState } from "@/lib/actions/shared"
import { inventoryItemSchema } from "@/lib/schemas/inventory"

export async function createItem(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const result = inventoryItemSchema.safeParse({
    name: formData.get("name"),
    quantity: formData.get("quantity"),        // coerced by z.coerce.number()
    category_id: formData.get("category_id"),
  })

  if (!result.success) {
    return { fieldErrors: collectFieldErrors(result.error.issues) }
  }

  // proceed with result.data (typed & validated)
}
```

`collectFieldErrors` converts Zod issues to `Record<string, string>` (first error per field).

---

## Client Form Pattern

```tsx
"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { createItem } from "@/lib/actions/inventory/create-item"
import type { AdminFormState } from "@/lib/actions/shared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

const initialState: AdminFormState = { success: false, error: null, fieldErrors: {} }

export function ItemForm() {
  const [state, formAction, isPending] = useActionState<AdminFormState>(
    createItem,
    initialState,
  )

  useEffect(() => {
    if (state.success) toast.success("Item creado")
    else if (state.error) toast.error(state.error)
  }, [state])

  return (
    <form action={formAction} className="space-y-4">
      {/* Field with inline error */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" placeholder="Nombre del item" required />
        {state.fieldErrors?.name && (
          <p className="text-sm text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Cantidad</Label>
        <Input id="quantity" name="quantity" type="number" min={1} defaultValue={1} />
        {state.fieldErrors?.quantity && (
          <p className="text-sm text-destructive">{state.fieldErrors.quantity}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Crear
      </Button>
    </form>
  )
}
```

---

## Cross-field Validation with `superRefine`

```ts
// lib/schemas/reservations.ts
export const reservationSchema = z
  .object({
    startsAt: z.string().datetime("Fecha de inicio inválida"),
    endsAt: z.string().datetime("Fecha de fin inválida"),
    quantity: z.number().int().min(1),
  })
  .superRefine((value, ctx) => {
    const start = new Date(value.startsAt)
    const end = new Date(value.endsAt)
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de fin debe ser posterior al inicio",
        path: ["endsAt"],
      })
    }
  })
```

---

## Row Schema Pattern

Define a separate row schema for validating database responses:

```ts
export const cabinetRowSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  name: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  status: z.enum(["available", "in_use", "locked"]),
  is_open: z.boolean(),
})
```

---

## Conventions

- **Always** define schemas in `lib/schemas/<domain>.ts`, not inline in action files.
- **Always** export `z.infer<typeof schema>` types alongside schemas.
- **Always** use `z.coerce.number()` when parsing numbers from `FormData`.
- **Always** provide Spanish error messages (this is a Spanish-language app).
- **Always** display field errors inline beneath the input with `text-sm text-destructive`.
- **Never** validate manually — always use Zod.
- Use `safeParse` in actions (never `parse` — it throws, disrupting the `AdminFormState` pattern).
