# Skill: senior-frontend-guidelines

## Purpose
Defines senior-level conventions for frontend code quality, maintainability, and architecture in this project.

---

## Component Architecture

### Server vs Client split

- **Server Components** (default): data fetching, layout, static UI.
- **Client Components** (`"use client"`): forms, interactivity, hooks, real-time UI.
- Pass data down as **props** from Server → Client; never fetch in Client Components.

```
Server Component (page.tsx)
  └── fetches data
  └── renders Client Component with data as props
        └── manages local state, form interactions, toasts
```

### Component file naming

- One component per file, named after the component: `cabinet-form.tsx` → `CabinetForm`.
- Domain-specific components go in `components/<domain>/`.
- Shared/generic UI goes in `components/ui/`.

---

## TypeScript

- Always use explicit types for props, return types, and state.
- Prefer `type` over `interface` for object shapes (unless extending).
- Use `unknown` instead of `any`; cast only when necessary with explanation.
- Use Zod-inferred types via `z.infer<typeof schema>` rather than duplicating types.

```ts
// ✅ Good
type CabinetFormProps = {
  initialData?: { id: string; name: string }
  onSuccess?: () => void
}

// ❌ Bad
function MyForm(props: any) { ... }
```

---

## Error Handling

- Server Actions return `AdminFormState` — never throw in actions.
- Field errors are surfaced inline next to each input.
- Top-level action errors trigger a `toast.error()` via `useEffect`.
- Successful actions trigger `toast.success()`.

```tsx
useEffect(() => {
  if (state.success) toast.success("Operación exitosa")
  else if (state.error) toast.error(state.error)
}, [state])
```

---

## Loading States

- Use `isPending` from `useActionState` to disable submit buttons.
- Show a spinning `Loader2` icon during pending state.

```tsx
<Button type="submit" disabled={isPending}>
  {isPending && <Loader2 className="size-4 animate-spin" />}
  {isPending ? "Guardando…" : "Guardar"}
</Button>
```

---

## Accessibility

- Always pair `<Label htmlFor="...">` with the corresponding input `id`.
- Use semantic HTML elements (`<main>`, `<nav>`, `<section>`).
- Add `id="main-content"` to `<main>` for skip-navigation.
- Use `aria-*` attributes where Shadcn doesn't handle it automatically.

---

## Separation of Concerns

| Layer | Location | Responsibility |
|---|---|---|
| Pages | `app/` | Route entry points, data fetching, composition |
| Actions | `lib/actions/` | Mutations, validation, auth guards |
| Data fetchers | `lib/data/` | Read queries |
| Schemas | `lib/schemas/` | Zod validation shapes |
| Components | `components/` | UI rendering |
| Hooks | `hooks/` | Client-side state/effects |
| Utilities | `lib/utils.ts` | Pure helper functions |

---

## Imports

- Always use `@/` alias, never relative `../../../` paths.
- Group imports: external libraries → internal lib → internal components → types.

```ts
// External
import { useEffect } from "react"
import { toast } from "sonner"

// Internal lib
import { createCabinet } from "@/lib/actions/cabinets/create-cabinet"
import type { AdminFormState } from "@/lib/actions/shared"

// Internal components
import { Button } from "@/components/ui/button"
```

---

## Conventions

- **No magic strings** — use constants or enums for repeated values (e.g. status values).
- **No commented-out code** — delete it.
- **No console.log** in production code (only `console.error` for caught errors).
- **Prefer** `const` over `let`; avoid `var`.
- **Prefer** explicit `null` checks over truthy coercions for nullable values.
- Use `formatDate` from `lib/utils.ts` for date formatting.
- Language: UI text is in **Spanish** (this is a Spanish-language app).
