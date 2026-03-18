# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->

## Next.js: ALWAYS read docs before coding

Before any Next.js work, consult the official Next.js documentation at https://nextjs.org/docs. Your training data may be outdated — the official docs are the source of truth.

**Current version**: Next.js 16.1.6 (App Router)

Key documentation areas:

- App Router fundamentals: https://nextjs.org/docs/app/building-your-application/routing
- Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- Metadata API: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- Image Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/images
- Font Optimization: https://nextjs.org/docs/app/building-your-application/optimizing/fonts

**When upgrading to Next.js 16.2.0-canary.37 or later**: Bundled documentation will be available at `node_modules/next/dist/docs/` and should be consulted before any code changes.

<!-- END:nextjs-agent-rules -->

---

This file provides guidance to AI coding agents when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Build for production
npm build

# Start production server
npm start

# Lint code (with auto-fix available)
npm run lint
npm run lint:fix

# Format code with Prettier
npm run format
npm run format:write

# Type check without emitting
npm run typecheck
```

Visit http://localhost:3000 after running `npm run dev`.

## Stack Overview

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19 with React Compiler enabled (babel-plugin-react-compiler)
- **Components**: shadcn/ui + Radix UI + Tailwind v4
- **Database**: Supabase (PostgreSQL + Auth)
- **Data Fetching**: Supabase JS SDK (server/browser clients)
- **State Management**: TanStack React Table, useActionState (React 19)
- **Validation**: Zod v4
- **Tables**: @tanstack/react-table
- **Notifications**: sonner toasts
- **Dates**: date-fns
- **Styling**: Tailwind CSS v4, CSS-in-JS with CVA

## Architecture Patterns

### Type System — Single Source of Truth

All domain types live in `lib/types/` organized by domain:

- `cabinets.ts` — Cabinet, InventoryItem, WithdrawnItem, CabinetAdmin, etc.
- `categories.ts` — Category
- `users.ts` — AdminUser, DashboardKpis
- `logs.ts` — AccessLogEntry, SessionItemSummary

**Rule**: Data functions and components always import from `lib/types/`, never define types inline.

### Schemas — Validation at System Boundaries

Zod schemas in `lib/schemas/` organized by domain:

- `auth.ts` — loginSchema, registerSchema, updatePasswordSchema
- `cabinets.ts` — withdrawSchema, returnSchema, cabinetSchema
- `items.ts` — inventoryItemSchema
- `categories.ts` — categoryNameSchema

**Rule**: Validate FormData in server actions, never skip validation.

### Server Actions — Two Patterns

**1. Form Actions** (used with `useActionState`)

```typescript
// lib/actions/cabinets/manage.ts
export async function createCabinet(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  // Validate → Transform → Execute → Return { fieldErrors?, error?, success? }
}
```

Returns `AdminFormState` with field-level errors or success flag.

**2. Imperative Actions** (used with onClick handlers)

```typescript
export async function deleteCabinet(id: string): Promise<{ error?: string }>
```

Simple error-only return type for mutations without form state.

**Shared utilities** in `lib/actions/shared.ts`:

- `assertAdmin()` — Checks auth + admin role, throws on failure
- `collectFieldErrors()` — Normalizes Zod validation errors to field map

### Data Functions — Supabase-First

Located in `lib/data/` organized by domain:

- Each function accepts a `SupabaseClient` (passed from page/layout)
- Use `lib/supabase/get-current-user.ts` (React.cache wrapped) for auth+profile
- Cabinet mutations use Supabase RPCs; admin CRUD uses direct table queries
- Data functions are NOT cached — pages/components pass the client and handle caching

Example pattern:

```typescript
// lib/data/cabinets/get-cabinets.ts
export async function getCabinetsWithCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Cabinet[]>
```

### Component Architecture

**Shared UI** in `components/ui/`:

- `date-range-picker.tsx` — shadcn Popover+Calendar, ISO "YYYY-MM-DD" strings
- `skeleton.tsx` — Loading states
- Filter toolbar pattern: `flex flex-col gap-2` outer container

**Form dialogs**:

- Dialog shell owns `open` state (useState)
- Inner form component uses `useActionState` — auto-resets on remount
- useEffect listens to `state.success`, closes dialog, shows toast
- Select fields use `<Select name="field">` for native Radix integration

**Data tables** (TanStack Table):

- `columns` as module-level array when no state closure
- Use `useMemo` for columns when they close over state
- Pre-filter data with `useMemo` before passing to table (combining date range, pills, etc.)
- Pass `globalFilterFn` as function reference directly (avoids TS type error vs string key)

### Routing Structure

```
app/
├── (auth)/               # Login, register, password reset (no auth required)
├── (admin)/              # Admin routes with auth + role checks
│   ├── layout.tsx        # AppNav + AdminSubNav + min-h-screen wrapper
│   ├── admin/
│   │   ├── dashboard/    # Admin KPI overview
│   │   ├── users/        # User management
│   │   ├── cabinets/     # Cabinet CRUD + per-cabinet item management
│   │   └── logs/         # Access & session logs
│   └── [protected pages with loading.tsx]
├── cabinets/             # Cabinet grid (all authed non-pending users)
├── profile/              # Update name + password
├── history/              # Session history
└── page.tsx              # Root redirect
```

**Admin layout** (`app/(admin)/layout.tsx`):

- Renders AppNav + AdminSubNav + `min-h-screen bg-gray-50`
- Handles auth/role redirects
- Admin pages return only `<main>` content (not nav/nav boilerplate)
- All 6 admin routes have corresponding `loading.tsx` with Skeleton components

### React Compiler Behavior

React Compiler is enabled (`reactCompiler: true` in next.config.mjs).

- **Do NOT** use `useMemo`/`useCallback` manually — let the compiler handle it
- Write simple, dataflow-focused code; compiler optimizes
- Exception: `useMemo` for expensive transforms BEFORE passing to TanStack Table (needed to avoid re-filters)

## Key Files & When to Touch Them

| File                      | Purpose                    | When to Edit                                    |
| ------------------------- | -------------------------- | ----------------------------------------------- |
| `lib/types/*`             | Domain types               | Adding new entities or fields to existing types |
| `lib/schemas/*`           | Zod validation             | Updating form validation rules                  |
| `lib/actions/*/manage.ts` | Form + imperative actions  | New mutations (CRUD operations)                 |
| `lib/data/*`              | Data fetching              | Adding new queries or transforming data shapes  |
| `lib/supabase/server.ts`  | Server Supabase client     | Rarely — use createClient() everywhere          |
| `app/(admin)/layout.tsx`  | Admin shell                | Route guarding, layout structure                |
| `components/ui/*`         | Shared UI components       | Extending existing shadcn components            |
| `app/globals.css`         | Tailwind config + CSS vars | Color/spacing system changes                    |
| `next.config.mjs`         | Next.js config             | Rarely — already has reactCompiler enabled      |

## Database

- **Tables**: profiles, cabinets, inventory_categories, inventory_items, cabinet_sessions, session_items, access_logs
- **RPC Functions**: is_admin (auth check), withdraw (cabinet operation), return (session closing)
- **Roles**: pending → user → admin → root (checked with `is_admin` RPC)

**Supabase MCP Available**: HTTP endpoint configured in `.vscode/mcp.json` for Supabase schema inspection.

## Code Style & Conventions

### Imports & Exports

- Path aliases: `@/*` → repo root
- Group imports: React/Next → external libs → local lib → local components
- Types imported from `lib/types/` (single source of truth)

### Naming

- Server actions: camelCase functions (createCabinet, updateCabinet)
- Components: PascalCase
- Utilities: camelCase
- Database fields: snake_case (auto-handled by Supabase)

### Tailwind + Prettier

- `prettier-plugin-tailwindcss` auto-sorts class names
- CSS variables in `app/globals.css` for theme consistency
- Use `cn()` utility (from `lib/utils.ts`) to merge Tailwind classes with CVA variants

### Error Handling

- Server actions return `{ error?: string }` or `AdminFormState`
- Client calls to actions wrapped in try-catch, toast errors to user
- Don't throw from server actions — return error state instead

### FormData Patterns

In server actions:

```typescript
const name = formData.get("name") // string | null
const value = formData.get("field") || null // explicit null coercion
```

## Testing & Debugging

- No test files in the current setup — add tests in `__tests__/` or `.test.ts` alongside source
- Use TypeScript strict mode (`tsconfig.json` has `strict: true`)
- Linter: ESLint with Next.js + Prettier integration; run `npm run lint:fix`
- Type check: `npm run typecheck` (tsc --noEmit)

## Common Workflows

### Add a New User-Facing Feature

1. Create type in `lib/types/domain.ts`
2. Create schema in `lib/schemas/domain.ts`
3. Create server action in `lib/actions/domain/manage.ts`
4. Create data function in `lib/data/domain/get-*.ts`
5. Build UI component in `components/domain/`
6. Wire in routes under `app/` or `app/(admin)/`

### Modify Existing Form

1. Update schema in `lib/schemas/domain.ts`
2. Check server action in `lib/actions/domain/manage.ts`
3. Update form component in `components/domain/` (field names must match FormData keys)

### Add Admin Feature

1. Add to `lib/actions/users/manage.ts` → call `assertAdmin()`
2. Create data function in `lib/data/*/get-*.ts`
3. Add route under `app/(admin)/` (layout auto-handles auth check)
4. Add menu item to `components/layout/admin-sub-nav.tsx`

### Debug Data Flow

1. Check browser DevTools Network tab (server action calls)
2. Inspect FormData keys in action (use console.log on formData.get keys)
3. Use `npm run typecheck` to catch type mismatches early
4. Check Supabase RPC responses in server logs

## Environment & Config

- **Environment**: `.env.local` (Supabase URL + API keys)
- **Client**: `lib/supabase/client.ts` for browser
- **Server**: `lib/supabase/server.ts` for Server Components + Actions
- **Database Types**: `lib/supabase/database.types.ts` (auto-generated from Supabase schema)

To regenerate types:

```bash
npx supabase gen types typescript --project-id=<your-project-id> > lib/supabase/database.types.ts
```

## Formatting & Linting

- **Prettier**: No semicolons, single quotes (sorted by prettier-plugin-tailwindcss)
- **ESLint**: react/self-closing-comp enforced; react-in-jsx-scope off (Next.js 13+)
- Run `npm run format:write` before committing to auto-format

---

**Last updated**: Current architecture as of March 2026. For future changes, update this file to reflect new patterns discovered across multiple files.
