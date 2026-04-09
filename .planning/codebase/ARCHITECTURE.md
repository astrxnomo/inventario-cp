# Architecture

**Analysis Date:** 2026-04-08

## Pattern Overview

**Overall:** Server-first, domain-oriented layered architecture on Next.js App Router with Supabase as the backend platform.

**Key Characteristics:**
- Route-driven composition in `app/` with Server Components as the default render boundary (for example `app/(home)/page.tsx`, `app/(admin)/admin/page.tsx`).
- Mutation/query separation by folder: writes in `lib/actions/*`, reads in `lib/data/*` (for example `lib/actions/cabinets/create-cabinet.ts` vs `lib/data/cabinets/get-cabinets.ts`).
- Shared infrastructure adapters for auth/session/database in `lib/supabase/*` and edge/session orchestration through `proxy.ts` and `lib/supabase/proxy.ts`.

## Layers

**Routing and Composition Layer:**
- Purpose: Define URL structure, route groups, page composition, and layout-level access boundaries.
- Location: `app/`, plus request interception in `proxy.ts`.
- Contains: `layout.tsx`, `page.tsx`, `loading.tsx`, route handlers like `app/(auth)/auth/callback/route.ts`.
- Depends on: `lib/data/*`, `lib/actions/*`, `lib/supabase/*`, and `components/*`.
- Used by: Next.js runtime.

**UI and Interaction Layer:**
- Purpose: Render UI and handle client interactions.
- Location: `components/` and `hooks/`.
- Contains: Domain UI (`components/admin/*`, `components/cabinets/*`), app shell (`components/layout/*`), generic UI (`components/ui/*`), table primitives (`components/tables/*`), reactive hooks (`hooks/use-cabinets.ts`).
- Depends on: Action functions (for forms/commands), shared types, and realtime subscriptions.
- Used by: Route pages/layouts in `app/*`.

**Mutation Layer (Server Actions):**
- Purpose: Handle state changes, authorization checks, validation, and cache revalidation.
- Location: `lib/actions/*`.
- Contains: Auth actions (`lib/actions/auth/login.ts`), domain actions (`lib/actions/cabinets/create-cabinet.ts`, `lib/actions/users/update-role.ts`), shared guards/helpers (`lib/actions/shared.ts`).
- Depends on: `lib/schemas/*`, `lib/supabase/server.ts`, `next/cache` (`revalidatePath`).
- Used by: Client forms and command UIs in `components/*`.

**Query Layer (Data Fetchers):**
- Purpose: Encapsulate read-side data access for pages and dashboards.
- Location: `lib/data/*`.
- Contains: Domain fetchers such as `lib/data/cabinets/get-cabinets.ts`, `lib/data/users/get-all-users.ts`, `lib/data/dashboard/get-dashboard.ts`.
- Depends on: `lib/supabase/server.ts`, shared domain types from `lib/types/*`.
- Used by: Server pages/layouts in `app/*`.

**Validation and Domain Model Layer:**
- Purpose: Validate untrusted inputs and centralize typed domain contracts.
- Location: `lib/schemas/*`, `lib/types/*`.
- Contains: Zod schemas (`lib/schemas/cabinets.ts`) and enriched domain types (`lib/types/cabinets.ts`).
- Depends on: Zod and generated DB types from `lib/supabase/types.ts`.
- Used by: Actions, data functions, and components.

**Infrastructure and Integration Layer:**
- Purpose: Provide environment-specific Supabase clients and session synchronization.
- Location: `lib/supabase/*`, `proxy.ts`.
- Contains: Browser client (`lib/supabase/client.ts`), server client (`lib/supabase/server.ts`), current-user resolver (`lib/supabase/get-current-user.ts`), proxy update flow (`lib/supabase/proxy.ts`).
- Depends on: `@supabase/ssr`, `next/headers`, `next/server`, runtime env vars.
- Used by: Pages, actions, data fetchers, and route handlers.

## Data Flow

**Server Page Render Flow:**

1. Request enters `proxy.ts`, which delegates session handling to `lib/supabase/proxy.ts`.
2. Route page in `app/*/page.tsx` resolves auth/user (`lib/supabase/get-current-user.ts`) and redirects if needed.
3. Page fetches read models through `lib/data/*` (for example `app/(home)/page.tsx` -> `lib/data/cabinets/get-cabinets.ts`).
4. Page composes UI from `components/*` and returns rendered markup.

**Server Action Mutation Flow:**

1. Client component form/event triggers a server action (for example `components/auth/login-form.tsx` -> `lib/actions/auth/login.ts`).
2. Action validates input with Zod schema (`lib/schemas/*`).
3. Action executes mutation through Supabase server client and shared guards (`lib/actions/shared.ts`).
4. Action returns typed state/errors and optionally revalidates route cache (`revalidatePath`).

**Realtime Synchronization Flow:**

1. Client hook (`hooks/use-cabinets.ts`) subscribes via `subscribeCabinetsGrid` in `lib/realtime/cabinets.ts`.
2. Supabase broadcast events update in-memory state through callback deltas.
3. UI components (for example `components/cabinets/cabinet-grid.tsx`) re-render from updated hook state.

**State Management:**
- Server state is fetched per request through Server Components and `lib/data/*`.
- Client state is local and event-driven (`useState`, `useTransition`, `useActionState`) in `components/*` and `hooks/*`.
- Session/auth state is synchronized at the edge/request layer via `proxy.ts` and reused via cached helper `getCurrentUser`.

## Key Abstractions

**Current User Resolver (`getCurrentUser`):**
- Purpose: Single cached abstraction for current auth user + profile lookup.
- Examples: `lib/supabase/get-current-user.ts`, consumers in `app/(admin)/layout.tsx` and `app/(home)/page.tsx`.
- Pattern: Read-through helper with React `cache()` to avoid duplicate lookups during render trees.

**Action Form State Contract:**
- Purpose: Normalize success/error/field error handling across admin action forms.
- Examples: `lib/actions/shared.ts` (`AdminFormState`, `collectFieldErrors`), used in `lib/actions/cabinets/create-cabinet.ts`.
- Pattern: Return serializable state object instead of throwing for validation errors.

**Domain Read Models:**
- Purpose: Extend raw DB rows with derived/computed properties for UI rendering.
- Examples: `lib/types/cabinets.ts` (`Cabinet` with `_count` and `item_names`), produced by `lib/data/cabinets/get-cabinets.ts`.
- Pattern: Query multiple tables then compose enriched view model in TypeScript.

**Generic Table Rendering Abstraction:**
- Purpose: Reuse filtering/sorting/pagination infrastructure across admin modules.
- Examples: `components/tables/data-table.tsx` used by `components/admin/cabinets/table.tsx` and other admin tables.
- Pattern: Generic component with typed column definitions and optional controlled state.

## Entry Points

**Root Application Shell:**
- Location: `app/layout.tsx`
- Triggers: Every route render.
- Responsibilities: Global metadata/viewport, fonts, theme provider, toast provider.

**Admin Access Shell:**
- Location: `app/(admin)/layout.tsx`
- Triggers: Requests to `/admin/*`.
- Responsibilities: Role gate (`admin`/`root`), fetch sidebar counters, render admin sidebar scaffold.

**Public/Home Route:**
- Location: `app/(home)/page.tsx`
- Triggers: Requests to `/`.
- Responsibilities: User-state branching (`pending`/`denied`/active), fetch cabinets, render cabinet grid.

**Auth Callback Route Handler:**
- Location: `app/(auth)/auth/callback/route.ts`
- Triggers: OAuth callback from Supabase auth provider.
- Responsibilities: Exchange auth code for session and redirect to target path.

**Request Session Synchronization:**
- Location: `proxy.ts` + `lib/supabase/proxy.ts`
- Triggers: Matched incoming requests.
- Responsibilities: Refresh session cookies and redirect unauthenticated traffic away from protected routes.

## Error Handling

**Strategy:** Fail-safe at boundaries with user-safe messages in actions and route redirects in pages/layouts.

**Patterns:**
- Actions return typed `{ error, fieldErrors, success }` states for UI feedback (`lib/actions/auth/login.ts`, `lib/actions/cabinets/create-cabinet.ts`).
- Auth/access failures in Server Components trigger `redirect()` (`app/(admin)/layout.tsx`, `app/history/page.tsx`, `app/profile/page.tsx`).
- Data fallback is used for analytics resiliency when RPC fails (`lib/data/dashboard/get-dashboard.ts`).

## Cross-Cutting Concerns

**Logging:** Uses `console.error` in data fallback/error branches (for example `lib/data/dashboard/get-dashboard.ts`) and Next browser-to-terminal logging enabled in `next.config.mjs`.

**Validation:** Zod schemas in `lib/schemas/*` are the input gate for server actions (for example `lib/schemas/cabinets.ts` consumed by `lib/actions/cabinets/create-cabinet.ts`).

**Authentication:**
- Request-level session sync and redirect in `proxy.ts` + `lib/supabase/proxy.ts`.
- Route-level gating with `getCurrentUser` and role checks in `app/(admin)/layout.tsx`.
- Action-level authorization through `assertAdmin()` in `lib/actions/shared.ts`.

---

*Architecture analysis: 2026-04-08*
