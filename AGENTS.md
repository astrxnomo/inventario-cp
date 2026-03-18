# AGENTS.md

Operational guide for agentic coding assistants in this repository.

## Scope and Priority

- This file is the primary source of repo-specific agent behavior.
- If conflicts exist, follow system/developer instructions first, then this file.
- Keep changes minimal, typed, and consistent with existing architecture.

## Project Snapshot

- Framework: Next.js 16.1.6 (App Router) with React 19.
- Styling/UI: Tailwind CSS v4, shadcn/ui, Radix.
- Backend/data: Supabase (Postgres + Auth + RPC).
- Validation: Zod v4.
- Tables/UI state: TanStack Table, `useActionState`.
- TypeScript: strict mode enabled.

## Commands (Build/Lint/Test)

```bash
# install
npm install

# local development
npm run dev

# production
npm run build
npm start

# static quality
npm run typecheck
npm run lint
npm run lint:fix
npm run format:write
```

### Test Commands

- There is currently no test runner configured in `package.json`.
- If tests are added later, prefer these conventions:
  - Run all tests: `npm test`
  - Run one file: `npm test -- path/to/file.test.ts`
  - Run one test name: `npm test -- -t "test name"`
- Suggested test file patterns: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`.

## Required Agent Workflow

1. Read relevant files before editing.
2. Make focused changes only in impacted areas.
3. Run, at minimum, `npm run typecheck` after non-trivial changes.
4. Run lint/format when touching multiple files or UI-heavy code.
5. Do not rewrite unrelated architecture or conventions.

## Code Style Guidelines

### Imports and Module Boundaries

- Use path alias `@/*` from repo root.
- Import order: React/Next → external libs → `@/lib/*` → `@/components/*`
- Prefer named exports for shared utilities and types.
- Keep server-only logic in server files/actions; avoid leaking to client components.

### Formatting

- Prettier: no semicolons, double quotes, Tailwind class sorting via `prettier-plugin-tailwindcss`
- Use `npm run format:write` instead of manual style edits.

### TypeScript and Types

- Preserve strict typing; avoid `any` unless unavoidable.
- Domain types belong in `lib/types/*` (single source of truth).
- Import types from `lib/types/*` instead of redefining inline.
- Keep function return types explicit in shared/data/action layers.

### Naming

- Components: PascalCase (`CabinetDialog`).
- Functions/variables: camelCase (`getCabinetsWithCounts`).
- Constants: UPPER_SNAKE_CASE only for true constants.
- Database columns and payload keys follow snake_case.

### Validation and Forms

- Validate all external input with Zod schemas in `lib/schemas/*`.
- In server actions, parse `FormData` and return structured error states.
- Use shared helpers (e.g. `collectFieldErrors`) for consistency.

### Error Handling

- Server actions should return error objects/states, not crash flows.
- Use `try/catch` around Supabase mutations and RPC calls.
- Keep user-facing messages concise; log details only when useful.

## Architecture Conventions

### Data Fetching

- Fetch data in Server Components and server-side data functions.
- **Always pass Supabase clients into `lib/data/*` functions as parameters** (never create clients inside data functions).
- Use `unstable_cache` from Next.js for caching expensive queries (see Cache Strategy below).
- Use server actions for mutations and call `revalidateTag` after mutations (not `revalidatePath`).
- Avoid direct DB writes from client components.
- **Client components calling data functions**: Client components must create a browser client using `createClient()` from `@/lib/supabase/client` and pass it to data functions.
- **Server components/actions calling data functions**: Use `await createClient()` from `@/lib/supabase/server`.

### Cache Strategy

- Use centralized cache tags from `lib/cache/tags.ts` (never hardcode tag strings).
- Cache revalidation times:
  - Static data (categories): 300s (5 min) - `CACHE_REVALIDATE.static`
  - Semi-static (cabinets, items): 30s - `CACHE_REVALIDATE.semiStatic`
  - Dynamic (sessions, reservations): 10s or rely on tag invalidation - `CACHE_REVALIDATE.dynamic`
  - Dashboard stats: 60s - `CACHE_REVALIDATE.dashboard`
- Always use `revalidateTag(CACHE_TAGS.xxx)` in server actions after mutations.
- Example:

  ```ts
  import { unstable_cache } from "next/cache"
  import { CACHE_TAGS, CACHE_REVALIDATE } from "@/lib/cache/tags"

  export const getCategories = unstable_cache(
    async (supabase) => {
      /* query */
    },
    ["categories-list"],
    { revalidate: CACHE_REVALIDATE.static, tags: [CACHE_TAGS.categories] },
  )
  ```

### Pagination

- **Use cursor-based pagination** for all tables (not offset-based).
- Import helpers from `lib/data/pagination.ts`:
  ```ts
  import { applyCursorPagination, type CursorPage } from "@/lib/data/pagination"
  ```
- Cursor pagination uses keyset (created_at + id) for efficiency.
- Page sizes: [10, 25, 50] (default: 25).
- Always return `CursorPage<T>` with `hasNextPage`, `hasPrevPage`, `nextCursor`, `prevCursor`.

### Table Components

- **Use reusable table components** from `components/ui/`:
  - `<DataTable>` - Generic TanStack Table wrapper with sorting, column visibility, loading states
  - `<TableToolbar>` - Search input (300ms debounce), column visibility dropdown, custom filter slot
  - `<TablePagination>` - Cursor-based navigation with page size selector
  - `<TableSkeleton>` - Loading skeleton for Suspense boundaries
- **Suspense pattern**: Wrap tables in `<Suspense fallback={<TableSkeleton />}>` for loading states.
- **Column visibility**: Stored in localStorage with key `table-columns-visibility-{tableName}`.
- **Search**: Case-insensitive, debounced (300ms), searches only essential columns.

### Auth and Authorization

- Use Supabase auth helpers from `lib/supabase/*`.
- Admin-sensitive mutations should go through explicit guards (e.g. `assertAdmin`).
- Respect role model in `profiles.role`: `pending`, `user`, `admin`, `root`.

### UI Patterns

- Reuse `components/ui/*` building blocks.
- Keep dialogs/forms predictable: controlled open state + action state handling.
- Keep tables deterministic and typed.

## Skills and Documentation Policy

### Context7 CLI + Skills (Installed)

This project uses **Context7 CLI with agent skills** for specialized guidance:

**Installed skills** (in `.agents/skills/`):

- `shadcn` — shadcn/ui component management (source: shadcn/ui)
- `supabase-postgres-best-practices` — Postgres optimization (source: supabase/agent-skills)
- `vercel-react-best-practices` — React/Next.js performance (source: vercel-labs/agent-skills)
- `vercel-composition-patterns` — Component architecture patterns (source: vercel-labs/agent-skills)
- `senior-frontend` — Frontend scaffolding and bundle analysis
- `nextjs-server-components`, `nextjs-data-fetching`, `next-best-practices` — Next.js patterns
- `find-docs` — Documentation lookup

**How to use**:

- Skills auto-load based on context (e.g., "optimize component" → vercel-react-best-practices)
- Explicit load: use the `skill` tool when specialized workflow is needed
- Check `skills-lock.json` for installed skills and versions

### Supabase MCP (Database Inspection)

- Remote Supabase MCP configured in `opencode.json` for:
  - Schema/table inspection via `supabase_list_tables`
  - SQL/RPC validation
  - Debugging database issues
  - Migration planning
- Use MCP tools over assumptions about current schema

## Rule Files Check

- No `.cursor/rules/*`, `.cursorrules`, or `.github/copilot-instructions.md` were found in this repo at the time of writing.
- If added later, update this file and treat those rules as additional constraints.

## Key Paths

- `app/` - routes, layouts, server components
- `components/` - UI and feature components
- `components/ui/` - Reusable UI components (shadcn + custom):
  - `data-table.tsx` - Generic table wrapper with TanStack Table
  - `table-toolbar.tsx` - Search and filter toolbar
  - `table-pagination.tsx` - Cursor-based pagination controls
  - `table-skeleton.tsx` - Loading skeleton for tables
- `lib/actions/` - server actions (must use `"use server"`)
- `lib/data/` - data access/query composition
  - `pagination.ts` - Cursor pagination helpers
- `lib/cache/` - Caching infrastructure
  - `tags.ts` - Centralized cache tags and revalidation times
- `lib/schemas/` - Zod schemas
- `lib/types/` - domain types
- `lib/supabase/` - Supabase clients and helpers

## Maintenance

- Keep this document around 150 lines and practical.
- Update commands/rules when tooling changes.
- Last updated: 2026-03-18.
