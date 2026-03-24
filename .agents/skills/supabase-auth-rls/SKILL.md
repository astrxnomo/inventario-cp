# Skill: supabase-auth-rls

## Purpose
Defines how Supabase Auth and Row-Level Security (RLS) are used in this project for authentication, session management, and access control.

---

## Supabase Client Setup

### Server client (Server Components & Actions)

```ts
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Ignore: called from Server Component
          }
        },
      },
    },
  )
}
```

Always `await createClient()` before use.

### Browser/client client

Use `lib/supabase/client.ts` (browser client) only from `"use client"` components that need direct Supabase access (e.g. real-time subscriptions).

---

## Authentication Flow

| Action | File |
|---|---|
| Login | `lib/actions/auth/login.ts` |
| Register | `lib/actions/auth/register.ts` |
| Sign out | `lib/actions/auth/sign-out.ts` |
| Reset password | `lib/actions/auth/reset-password.ts` |
| Update password | `lib/actions/auth/update-password.ts` |
| Update profile | `lib/actions/auth/update-profile.ts` |

OAuth callback route: `app/(auth)/auth/callback/route.ts`

---

## Admin Auth Guard

Every admin Server Action must call `assertAdmin()` before any database mutation:

```ts
import { assertAdmin } from "@/lib/actions/shared"

// Inside an action:
const supabase = await assertAdmin()
// Throws "No autenticado" or "Sin permisos de administrador" if check fails
```

`assertAdmin()` internally:
1. Creates a server Supabase client
2. Gets the current user with `supabase.auth.getUser()`
3. Calls the `is_admin` RPC function to verify admin role
4. Returns the authenticated client for chaining

---

## Row-Level Security

RLS is enforced at the database level in Supabase. Key rules:
- All tables have RLS enabled.
- Regular users can only read/write their own rows (enforced by `auth.uid()`).
- Admin-level mutations use a server-side client with full access via the service role where appropriate, or rely on RLS policies granting admin roles elevated access.
- **Never** bypass RLS in application code — let Supabase enforce it.
- **Never** expose the service role key client-side.

---

## Environment Variables

| Variable | Used for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key (public) |

Never commit secrets. The service role key (if used) must only appear in server-side environment variables (without `NEXT_PUBLIC_` prefix).

---

## Checking Auth State in Server Components

```ts
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect("/login")
```

---

## Database RPC

Custom Postgres functions are called via `.rpc()`:

```ts
const { data: isAdmin } = await supabase.rpc("is_admin")
```

---

## Conventions

- **Always** use `createClient()` from `lib/supabase/server.ts` in Server Components and Actions.
- **Always** call `assertAdmin()` before any admin mutation.
- **Never** trust client-provided user IDs for ownership checks — use `auth.uid()` via RLS or `supabase.auth.getUser()`.
- **Never** expose service role keys in client code or public env vars.
- **Never** disable RLS on any table.
