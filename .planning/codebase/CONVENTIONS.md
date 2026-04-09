# Coding Conventions

**Analysis Date:** 2026-04-08

## Naming Patterns

**Files:**
- Use kebab-case for most feature files and route handlers: `lib/actions/cabinets/create-cabinet.ts`, `lib/data/reservations/get-all-reservations.ts`, `components/layout/nav-user.tsx`, `components/admin/users/change-role-dialog.tsx`.
- Use Next.js file-convention names in route tree: `app/layout.tsx`, `app/(home)/page.tsx`, `app/history/loading.tsx`.
- Custom hooks are prefixed with `use-` at file level and `use` at symbol level: `hooks/use-cabinets.ts` exports `useCabinets`, `hooks/use-mobile.ts` exports `useIsMobile`.

**Functions:**
- Prefer camelCase function names for actions/fetchers/helpers: `loginAction` in `lib/actions/auth/login.ts`, `getCabinetsWithCounts` in `lib/data/cabinets/get-cabinets.ts`, `collectFieldErrors` in `lib/actions/shared.ts`.
- Server actions are verb-oriented (`createReservation`, `updateUser`, `createCabinet`) in `lib/actions/**`.

**Variables:**
- Local variables use camelCase (`displayName`, `safeDays`, `itemCountMap`) in `components/layout/nav-user.tsx` and `lib/data/dashboard/get-dashboard.ts`.
- Shared constants use UPPER_SNAKE_CASE in component modules (`ROLE_LABELS`, `ROLE_BADGE_VARIANT`) in `components/layout/nav-user.tsx`.

**Types:**
- Type aliases and interfaces use PascalCase: `AuthState` (`lib/actions/auth/shared.ts`), `DashboardAnalytics` (`lib/data/dashboard/get-dashboard.ts`), `UserProfile` (`components/admin/users/columns.tsx`).
- Zod schema names end with `Schema`, and inferred input types end with `Input`: `loginSchema` / `LoginInput` in `lib/schemas/auth.ts`, `cabinetSchema` / `CabinetInput` in `lib/schemas/cabinets.ts`.

## Code Style

**Formatting:**
- Tool: Prettier (`package.json` scripts `format`, `format:write`).
- Key settings from `.prettierrc`:
  - No semicolons (`"semi": false`).
  - Double quotes (`"singleQuote": false`).
  - Tailwind class sorting via `prettier-plugin-tailwindcss` with stylesheet `app/globals.css`.
- Formatting style observed in source: no semicolons and multiline JSX props in `app/layout.tsx` and `components/tables/data-table.tsx`.

**Linting:**
- Tool: ESLint v9 flat config in `eslint.config.mjs`.
- Baseline: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- Plugins enabled: `import`, `prettier`, `react`, `autofix`.
- Key rules currently enforced:
  - `react/display-name`: error.
  - `react/self-closing-comp`: error.
  - `prettier/prettier`: warn.
  - `autofix/no-unused-vars`: warn with ignore patterns.
- Notable exceptions:
  - `@typescript-eslint/no-explicit-any`: off.
  - `no-unused-vars`: off.

## Import Organization

**Order:**
1. External dependencies are commonly imported first (`next/*`, `lucide-react`, `@tanstack/react-table`) in `app/layout.tsx`, `components/admin/users/columns.tsx`, `components/tables/data-table.tsx`.
2. Internal alias imports (`@/components`, `@/lib`, `@/hooks`) follow in most files, e.g., `components/auth/login-form.tsx` and `lib/actions/auth/login.ts`.
3. Relative imports (`./shared`, `../ui/submit-button`) appear after alias imports in many modules (`lib/actions/auth/login.ts`, `components/auth/login-form.tsx`).
- Strict deterministic ordering is not universally enforced; files are broadly consistent but not identical (`app/layout.tsx` mixes `next` imports and local CSS import).

**Path Aliases:**
- Primary alias is `@/*` configured in `tsconfig.json`.
- Shadcn alias map also configured in `components.json`:
  - `components`: `@/components`
  - `utils`: `@/lib/utils`
  - `ui`: `@/components/ui`
  - `lib`: `@/lib`
  - `hooks`: `@/hooks`

## Error Handling

**Patterns:**
- Server actions validate inputs with Zod and return typed error payloads instead of throwing in normal validation paths:
  - `loginAction` in `lib/actions/auth/login.ts` uses `safeParse` and returns `{ fieldErrors }` or `{ error }`.
  - `createReservation` in `lib/actions/reservations/create-reservation.ts` returns `ActionResult` with `data/error`.
- Admin actions often use `try/catch` around database mutations and return `{ error: message }` in catch:
  - `createCabinet` in `lib/actions/cabinets/create-cabinet.ts`.
- Shared permission guards throw explicit errors for unauthorized contexts:
  - `assertAdmin` in `lib/actions/shared.ts` throws on missing user/non-admin.
- Read/query functions often fail-soft and return empty collections/default objects:
  - `getAccessLogs` returns `[]` on error in `lib/data/activity/get-access-logs.ts`.
  - `getDashboardAnalytics` returns `EMPTY_ANALYTICS`-based fallback in `lib/data/dashboard/get-dashboard.ts`.

## Logging

**Framework:** console

**Patterns:**
- Error logging primarily uses `console.error` in data/reliability paths:
  - `lib/data/dashboard/get-dashboard.ts` logs RPC and query failures.
  - `lib/data/activity/get-access-logs.ts` logs access-log query failures.
  - `lib/utils/date.ts` logs timezone-format errors before local fallback.
- Application-level structured logging library is not detected.

## Comments

**When to Comment:**
- Comments are used sparingly, mostly for:
  - Section separators (`// ─── ... ───`) in schema/shared utility files (`lib/schemas/cabinets.ts`, `lib/actions/shared.ts`).
  - Intent notes for non-obvious behavior (`lib/realtime/cabinets.ts`, `proxy.ts`).
  - Localized explanatory comments in Spanish for business logic (`components/admin/users/table.tsx`, `lib/data/activity/get-access-logs.ts`).

**JSDoc/TSDoc:**
- Limited but present for integration-heavy code, especially realtime subscriptions in `lib/realtime/cabinets.ts`.
- Most modules rely on clear types and naming rather than full docblocks.

## Function Design

**Size:**
- UI helpers/hooks are typically small and focused (`hooks/use-mobile.ts`, `lib/utils/cn.ts`).
- Data aggregation functions can be large when consolidating analytics logic (`lib/data/dashboard/get-dashboard.ts`).

**Parameters:**
- Typed parameters are standard, including explicit payload types for actions (`CreateReservationPayload` in `lib/actions/reservations/create-reservation.ts`).
- Form-based server actions usually accept `(_prevState, formData)` for `useActionState` compatibility (`lib/actions/auth/login.ts`, `lib/actions/cabinets/create-cabinet.ts`).

**Return Values:**
- Mutations generally return explicit typed result objects (`AdminFormState`, `AuthState`, `ActionResult<T>`) from `lib/actions/**`.
- Data fetchers return typed collections/value objects with fallback defaults (`lib/data/**`).

## Module Design

**Exports:**
- Prefer named exports for functions/types/components (seen across `lib/actions/**`, `lib/data/**`, `components/**`).
- Default exports are mainly used for Next.js route entry components (`app/layout.tsx`, `app/(home)/page.tsx`).

**Barrel Files:**
- Selective barrel usage:
  - `lib/utils.ts` re-exports utility modules.
  - `components/tables/index.ts` re-exports table components and related types.
- Most feature directories still import direct module paths for clarity.

---

*Convention analysis: 2026-04-08*
