# Codebase Structure

**Analysis Date:** 2026-04-08

## Directory Layout

```text
inventario-inteligente-app/
|-- app/                          # Next.js App Router routes, layouts, loading boundaries
|   |-- (admin)/                  # Route group for admin surface
|   |   |-- layout.tsx            # Admin auth/role gate + sidebar shell
|   |   `-- admin/                # Admin pages by domain (users, cabinets, inventory, etc.)
|   |-- (auth)/                   # Route group for authentication
|   |   |-- layout.tsx            # Auth-only visual shell
|   |   |-- auth/                 # Login/register + callback route
|   |   `-- reset-password/       # Password recovery/update routes
|   |-- (home)/                   # Main user home route group
|   |-- history/                  # User session/reservation history pages
|   |-- profile/                  # User profile page
|   |-- layout.tsx                # Root layout/providers
|   `-- globals.css               # Global styles/theme tokens
|-- components/                   # UI composition layer
|   |-- admin/                    # Admin domain components per module
|   |-- auth/                     # Auth forms/tabs
|   |-- cabinets/                 # End-user cabinet browsing/detail components
|   |-- history/                  # History table and mobile filtering components
|   |-- layout/                   # App shell UI (nav/sidebar/user menus)
|   |-- profile/                  # Profile form component
|   |-- providers/                # Client providers (theme)
|   |-- tables/                   # Reusable table primitives over TanStack
|   `-- ui/                       # Shared UI primitives (shadcn/radix style)
|-- hooks/                        # Reusable client hooks
|-- lib/                          # Domain/business/infrastructure logic
|   |-- actions/                  # Server actions for mutations
|   |-- data/                     # Server-side read/query modules
|   |-- realtime/                 # Supabase realtime subscription helpers
|   |-- schemas/                  # Zod validation schemas
|   |-- supabase/                 # Supabase clients, session helpers, generated DB types
|   |-- types/                    # Domain-specific TS types
|   |-- utils/                    # Focused utility modules
|   `-- utils.ts                  # Shared utility entry (`cn` re-export style)
|-- public/                       # Static web assets/manifest/icons
|-- proxy.ts                      # Next proxy entry for request-level session sync
|-- package.json                  # Scripts + dependencies
|-- next.config.mjs               # Next runtime/build config
|-- tsconfig.json                 # TS strict config + path alias
|-- eslint.config.mjs             # Lint configuration
|-- components.json               # shadcn aliases and generation config
`-- .planning/codebase/           # Generated architecture reference docs
```

## Directory Purposes

**`app/`:**
- Purpose: Route tree and server composition boundaries.
- Contains: Route groups, page/layout/loading files, route handlers.
- Key files: `app/layout.tsx`, `app/(admin)/layout.tsx`, `app/(auth)/auth/callback/route.ts`.

**`components/`:**
- Purpose: UI composition for both server-rendered and client-interactive surfaces.
- Contains: Domain components, shared shell components, UI primitives.
- Key files: `components/layout/app-nav.tsx`, `components/layout/app-sidebar.tsx`, `components/tables/data-table.tsx`, `components/auth/login-form.tsx`.

**`lib/actions/`:**
- Purpose: Mutation layer using Next Server Actions.
- Contains: Domain folders with one action per file plus shared guards/state helpers.
- Key files: `lib/actions/shared.ts`, `lib/actions/cabinets/create-cabinet.ts`, `lib/actions/auth/login.ts`.

**`lib/data/`:**
- Purpose: Read/query layer that powers pages and dashboards.
- Contains: Domain fetchers and dashboard aggregations.
- Key files: `lib/data/cabinets/get-cabinets.ts`, `lib/data/dashboard/get-dashboard.ts`, `lib/data/users/get-all-users.ts`.

**`lib/supabase/`:**
- Purpose: Integration boundary for auth/session/database clients.
- Contains: Server/browser clients, proxy session updater, current-user helper, generated DB types.
- Key files: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/proxy.ts`, `lib/supabase/get-current-user.ts`.

**`lib/schemas/`:**
- Purpose: Input validation contracts.
- Contains: Zod schemas by domain.
- Key files: `lib/schemas/cabinets.ts`, `lib/schemas/auth.ts`.

**`lib/types/`:**
- Purpose: Domain models and UI-facing type contracts.
- Contains: Entity-specific TypeScript types.
- Key files: `lib/types/cabinets.ts`, `lib/types/users.ts`, `lib/types/data-table.ts`.

**`hooks/`:**
- Purpose: Reusable client-side state synchronization hooks.
- Contains: Realtime/state hooks and utility hooks.
- Key files: `hooks/use-cabinets.ts`, `hooks/use-mobile.ts`.

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Global root shell, providers, metadata.
- `proxy.ts`: Request interception and session refresh boundary.
- `app/(admin)/layout.tsx`: Admin route group gate and shell.
- `app/(home)/page.tsx`: Home page composition and role-based user branching.

**Configuration:**
- `package.json`: Scripts (`dev`, `build`, `lint`, `typecheck`) and dependency graph.
- `tsconfig.json`: Strict mode and `@/*` path alias.
- `next.config.mjs`: Next runtime config (`reactCompiler`, logging).
- `components.json`: shadcn aliases and UI generation settings.

**Core Logic:**
- `lib/actions/`: Mutation orchestration and authorization.
- `lib/data/`: Query orchestration and read model assembly.
- `lib/supabase/`: Infrastructure adapter for auth/session/DB.
- `lib/realtime/cabinets.ts`: Realtime event bridge for cabinet grid.

**Testing:**
- Not detected: no dedicated test directories or `*.test.*` / `*.spec.*` files were observed in `app/`, `components/`, `hooks/`, or `lib/` during this mapping pass.

## Naming Conventions

**Files:**
- Use kebab-case for most source files: `create-cabinet.ts`, `get-all-users.ts`, `pending-access-screen.tsx`.
- App Router convention files are fixed names: `page.tsx`, `layout.tsx`, `loading.tsx`, `route.ts`.
- Domain folder naming is pluralized by resource (`cabinets`, `users`, `reservations`) under `app/(admin)/admin/`, `lib/actions/`, and `lib/data/`.

**Directories:**
- Route groups use parenthesis syntax for URL-neutral grouping: `app/(admin)`, `app/(auth)`, `app/(home)`.
- UI directories are segmented by concern: `components/ui` (primitive), `components/tables` (composable data table), `components/admin/<domain>` (feature UI).
- Backend logic directories map to CRUD intent: `lib/actions/<domain>` for writes, `lib/data/<domain>` for reads.

## Where to Add New Code

**New Feature (domain already exists):**
- Primary page route: `app/(admin)/admin/<domain>/page.tsx` (admin) or `app/<domain>/page.tsx` (user-facing).
- Read logic: `lib/data/<domain>/get-*.ts`.
- Mutations: `lib/actions/<domain>/<verb>-<entity>.ts`.
- UI components: `components/admin/<domain>/` or `components/<domain>/` depending on audience.
- Validation/types: `lib/schemas/<domain>.ts` and `lib/types/<domain>.ts`.

**New Component/Module:**
- Reusable generic component: `components/ui/` (primitive) or `components/tables/` (table ecosystem).
- Domain-specific interactive component: `components/<domain>/` or `components/admin/<domain>/`.
- New client state hook tied to feature: `hooks/use-<feature>.ts`.

**Utilities:**
- Shared utility function: `lib/utils/<topic>.ts`.
- Supabase-specific helper: `lib/supabase/<helper>.ts`.
- Shared action helper or guard: `lib/actions/shared.ts` (or a sibling shared file in that domain).

## Special Directories

**`.planning/`:**
- Purpose: GSD planning and codebase mapping artifacts.
- Generated: Yes (workflow-generated docs and planning assets).
- Committed: Yes (intended to persist process knowledge).

**`.next/`:**
- Purpose: Next.js build artifacts.
- Generated: Yes.
- Committed: No (runtime/build output).

**`public/`:**
- Purpose: Static assets served directly (manifest and icons).
- Generated: No.
- Committed: Yes.

**`components/ui/`:**
- Purpose: Shared UI primitives configured via `components.json` and shadcn workflow.
- Generated: Mixed (many files scaffolded then locally adapted).
- Committed: Yes.

---

*Structure analysis: 2026-04-08*
