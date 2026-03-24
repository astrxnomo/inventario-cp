# Skill: nextjs-server-actions

## Purpose
Defines how to write, structure, and consume Next.js Server Actions in this project.  
All mutations (create, update, delete, auth) are implemented as Server Actions — never as API routes.

---

## File Location

```
lib/actions/<domain>/<verb>-<noun>.ts
```

Examples:
- `lib/actions/cabinets/create-cabinet.ts`
- `lib/actions/inventory/update-item.ts`
- `lib/actions/reservations/cancel-reservation.ts`

---

## Canonical Action Signature

Every admin mutation action follows this exact shape:

```ts
"use server"

import { assertAdmin, collectFieldErrors, type AdminFormState } from "@/lib/actions/shared"
import { mySchema } from "@/lib/schemas/my-domain"
import { revalidatePath } from "next/cache"

export async function myAction(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  // 1. Parse & validate with Zod
  const result = mySchema.safeParse({
    field: formData.get("field"),
  })
  if (!result.success) {
    return { fieldErrors: collectFieldErrors(result.error.issues) }
  }

  // 2. Auth guard
  try {
    const supabase = await assertAdmin()

    // 3. Database mutation
    const { error } = await supabase.from("table").insert(result.data)
    if (error) return { error: error.message }

    // 4. Revalidate affected paths
    revalidatePath("/admin/my-domain")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
```

### Actions that need a bound ID

When an action needs a resource ID (e.g. update, delete), use `.bind(null, id)` in the client component:

```ts
// Action signature
export async function updateCabinet(
  id: string,
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState>

// Client usage
const updateAction = updateCabinet.bind(null, cabinetId)
const [state, formAction] = useActionState(updateAction, initialState)
```

---

## Shared Utilities (`lib/actions/shared.ts`)

| Export | Description |
|---|---|
| `AdminFormState` | `{ fieldErrors?, error?, success? }` — the universal action return type |
| `assertAdmin()` | Auth guard — throws if caller is not authenticated or not admin; returns the Supabase client |
| `collectFieldErrors(issues)` | Converts Zod issue array to `Record<string, string>` (first error per field) |

### AuthState variant (for auth actions)

Auth actions live in `lib/actions/auth/` and use `AuthState` from `lib/actions/auth/shared.ts` instead of `AdminFormState`.

---

## Consuming Actions in Client Components

```tsx
"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { myAction } from "@/lib/actions/my-domain/my-action"
import type { AdminFormState } from "@/lib/actions/shared"

export function MyForm() {
  const [state, formAction, isPending] = useActionState<AdminFormState>(
    myAction,
    { success: false, error: null, fieldErrors: {} },
  )

  useEffect(() => {
    if (state.success) toast.success("Operación exitosa")
    else if (state.error) toast.error(state.error)
  }, [state])

  return (
    <form action={formAction} className="space-y-4">
      <input name="field" />
      {state.fieldErrors?.field && (
        <p className="text-sm text-destructive">{state.fieldErrors.field}</p>
      )}
      <button type="submit" disabled={isPending}>
        {isPending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  )
}
```

---

## Conventions & Rules

- **Always** add `"use server"` as the first line of every action file.
- **Always** use `AdminFormState` as the return type for admin actions.
- **Always** validate input with Zod before any database call.
- **Always** call `assertAdmin()` for any mutation that requires admin privileges.
- **Always** call `revalidatePath()` on the relevant admin route after a successful mutation.
- **Never** throw from an action — catch errors and return `{ error: message }`.
- **Never** put business logic in client components — keep it in actions.
- Keep each action in its own file named `<verb>-<noun>.ts`.

---

## Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Use `formData.get()` to extract inputs | Access `req.body` or use API routes for mutations |
| Return `{ success: true }` on success | Throw errors from server actions |
| Call `revalidatePath` after mutations | Forget to revalidate the cache |
| Use `assertAdmin()` for admin-only actions | Skip auth guards |
| Use `.bind(null, id)` for parameterized actions | Pass IDs via hidden form fields when `.bind` is cleaner |
| Put `"use server"` at file top | Mix server and client code in the same file |
