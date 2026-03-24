# Skill: nextjs-data-fetching

## Purpose
Defines how server-side data fetching is structured in this project — using dedicated fetcher functions under `lib/data/`, called directly from Server Components.

---

## File Location

```
lib/data/<domain>/<verb>-<noun>.ts
```

Examples:
- `lib/data/cabinets/get-cabinets.ts`
- `lib/data/inventory/get-all-items.ts`
- `lib/data/reservations/get-all-reservations.ts`
- `lib/data/dashboard/get-dashboard.ts`

---

## Fetcher Function Pattern

Data fetchers are plain async functions (not hooks). They call `createClient()` internally and return typed data.

### Simple fetcher (returns array)

```ts
import { createClient } from "@/lib/supabase/server"

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("inventory_categories")
    .select("*")
    .order("name")
  if (error) throw new Error(error.message)
  return data ?? []
}
```

### Fetcher returning `ActionResult<T>`

For data that may fail gracefully, return `ActionResult`:

```ts
import type { ActionResult } from "@/lib/types/cabinets"

export async function getItemsByCabinet(
  cabinetId: string,
): Promise<ActionResult<CabinetInventoryItem[]>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("inventory_items")
    .select("id, name, quantity, inventory_categories(name)")
    .eq("cabinet_id", cabinetId)
    .order("name")

  if (error) return { data: null, error: error.message }
  return { data: data ?? [], error: null }
}
```

### Parallel fetching in pages

Always use `Promise.all` to fetch multiple datasets concurrently:

```tsx
// app/(admin)/admin/inventory/page.tsx
export default async function AdminInventoryPage() {
  const supabase = await createClient()

  const [items, { data: categories }, { data: cabinets }] = await Promise.all([
    getAllItems(),
    supabase.from("inventory_categories").select("*"),
    supabase.from("cabinets").select("*"),
  ])

  return <InventoryItemsTable items={items} categories={categories ?? []} cabinets={cabinets ?? []} />
}
```

---

## Supabase Query Conventions

- Use `.select("col1, col2, related_table(col)")` for JOIN-like queries.
- Use `.order()` for deterministic ordering.
- Use `.limit()` for large tables (e.g. `.limit(200)` on activity logs).
- Use `.eq()`, `.is()`, `.lte()`, `.gte()` for filtering.
- Destructure `{ data, error }` and always handle `error`.

### Joined query example

```ts
const { data } = await supabase
  .from("item_reservations")
  .select(`
    id, user_id, quantity, starts_at, ends_at, status,
    profiles!inner(full_name),
    inventory_items!inner(name, inventory_categories(name)),
    cabinets!inner(name)
  `)
  .order("starts_at", { ascending: false })
  .limit(200)
```

---

## Real-time Data

For live data (e.g. cabinet status grid), use the `lib/realtime/` module with a custom hook:

```ts
// hooks/use-cabinets.ts
"use client"
import { subscribeCabinetsGrid } from "@/lib/realtime/cabinets"
import { useEffect, useState } from "react"

export function useCabinets(initialCabinets: Cabinet[]) {
  const [cabinets, setCabinets] = useState(initialCabinets)

  useEffect(() => {
    const unsubscribe = subscribeCabinetsGrid({
      onCabinetUpdate(id, changes) {
        setCabinets(prev => prev.map(c => c.id === id ? { ...c, ...changes } : c))
      },
    })
    return unsubscribe
  }, [])

  return cabinets
}
```

Pass `initialCabinets` from the Server Component as the seed state, then subscribe for live updates.

---

## Cache Revalidation

After mutations, call `revalidatePath` from the action to bust the Next.js cache:

```ts
import { revalidatePath } from "next/cache"
revalidatePath("/admin/cabinets")
```

For page-level refresh (e.g. a "Refresh" button), use `router.refresh()` from `useRouter` in a Client Component.

---

## Conventions

- Fetchers live in `lib/data/<domain>/`, one file per query.
- Fetchers are plain `async` functions — never hooks.
- Always `await createClient()` inside the fetcher.
- Always use `Promise.all` for parallel fetches in a page.
- Never fetch data inside Client Components — pass it as props from the Server Component.
- Use `"use server"` directive on fetcher files that are invoked from Server Actions (e.g. `get-availability.ts`).
