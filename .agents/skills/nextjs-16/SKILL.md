# Skill: nextjs-16

## Purpose
Defines how this project uses Next.js 16 (App Router) conventions, including routing, layouts, server/client components, and async params.

---

## App Router Structure

```
app/
├── layout.tsx                     # Root layout (Server Component)
├── globals.css
├── page.tsx                       # Home page
├── (auth)/                        # Auth route group (no segment in URL)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── reset-password/
│       ├── page.tsx
│       └── update/page.tsx
├── (admin)/                       # Admin route group
│   └── admin/
│       ├── dashboard/page.tsx
│       ├── cabinets/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx      # Dynamic segment
│       ├── inventory/page.tsx
│       ├── categories/page.tsx
│       ├── users/page.tsx
│       ├── reservations/page.tsx
│       ├── sessions/page.tsx
│       └── activity/page.tsx
├── profile/page.tsx
└── history/page.tsx
```

---

## Server Components (default)

All page components are **Server Components** by default. They can:
- `await` async calls directly
- Access Supabase server client
- Pass data as props to Client Components

```tsx
// app/(admin)/admin/inventory/page.tsx
import { getAllItems } from "@/lib/data/inventory/get-all-items"
import { createClient } from "@/lib/supabase/server"

export default async function AdminInventoryPage() {
  const supabase = await createClient()

  const [items, { data: categories }] = await Promise.all([
    getAllItems(),
    supabase.from("inventory_categories").select("*"),
  ])

  return (
    <main className="w-full px-4 py-6 lg:px-6">
      <InventoryItemsTable items={items} categories={categories ?? []} />
    </main>
  )
}
```

---

## Dynamic Route Params (Next.js 16)

In Next.js 16 `params` is a **Promise** — always `await` it:

```tsx
interface Props {
  params: Promise<{ id: string }>
}

export default async function CabinetDetailPage({ params }: Props) {
  const { id } = await params   // ✅ Must await
  // ...
}
```

---

## Client Components

Add `"use client"` only when the component needs:
- `useState`, `useEffect`, or other React hooks
- Browser APIs
- Event listeners / interactivity
- `useActionState` for forms

```tsx
"use client"

import { useActionState } from "react"
// ...
```

---

## Layout Pattern

```tsx
// app/layout.tsx — Root layout (Server Component)
import type { Metadata } from "next"
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Inventario Inteligente",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster richColors />
      </body>
    </html>
  )
}
```

---

## Notfound & Redirects

Use Next.js built-in utilities from `next/navigation`:

```tsx
import { notFound, redirect } from "next/navigation"

if (!item) notFound()         // renders not-found.tsx
redirect("/login")            // server-side redirect
```

---

## Path Aliases

All imports use `@/` alias (configured in `tsconfig.json`):

```ts
import { createClient } from "@/lib/supabase/server"
import { CabinetForm } from "@/components/admin/cabinets/form"
import type { AdminFormState } from "@/lib/actions/shared"
```

---

## Conventions

- **Server Components** by default; add `"use client"` only when necessary.
- **Async params** are always `await`-ed in dynamic route pages.
- **Parallel data fetching** with `Promise.all` in server pages.
- **Route groups** `(auth)`, `(admin)` for layout separation without URL segments.
- **No middleware** file — auth is enforced at the action/data-fetch level.
