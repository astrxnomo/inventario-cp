# Technology Stack

**Analysis Date:** 2026-04-08

## Languages

**Primary:**
- TypeScript 5.9.3 - Application code across App Router, components, actions, data, and utilities (evidence: `package.json`, `app/`, `components/`, `lib/`, `hooks/`)

**Secondary:**
- JavaScript (ESM) - Tooling/configuration files (evidence: `next.config.mjs`, `eslint.config.mjs`, `postcss.config.mjs`)
- CSS - Global styling and Tailwind stylesheet entry (evidence: `app/globals.css`, `components.json`)
- Markdown - Project and agent documentation (evidence: `README.md`, `AGENTS.md`)

## Runtime

**Environment:**
- Node.js runtime for Next.js 16 app execution and build pipeline (evidence: `package.json` scripts: `next dev --turbopack`, `next build`, `next start`)
- Node version pin file not detected (`.nvmrc`/`.node-version` absent in repository root)

**Package Manager:**
- npm commands are the documented/standard interface for scripts (`npm run dev|build|lint|typecheck`) (evidence: `package.json`, `AGENTS.md`)
- Lockfile: present (`pnpm-lock.yaml`), indicating pnpm lock resolution in repo while npm scripts are used for execution

## Frameworks

**Core:**
- Next.js 16.2.1 - Full-stack framework with App Router and route handlers (evidence: `package.json`, `app/`, `app/(auth)/auth/callback/route.ts`)
- React 19.2.4 - UI rendering and component model (evidence: `package.json`, `app/layout.tsx`, `components/`)
- Supabase SSR/Auth client stack (`@supabase/ssr` 0.10.0, `@supabase/supabase-js` 2.99.0) - Auth/session/database/realtime integration (evidence: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/proxy.ts`)

**Testing:**
- Not detected - no Jest/Vitest/Playwright/Cypress config files or test script in `package.json`

**Build/Dev:**
- Turbopack (through `next dev --turbopack`) - dev bundling (evidence: `package.json`)
- TypeScript 5.9.3 - static type checking (`tsc --noEmit`) (evidence: `package.json`, `tsconfig.json`)
- ESLint 9 + `eslint-config-next` - linting and rule enforcement (evidence: `package.json`, `eslint.config.mjs`)
- Prettier 3 + `prettier-plugin-tailwindcss` - formatting and class sorting (evidence: `package.json`, `.prettierrc`)
- Tailwind CSS 4 + PostCSS - styling pipeline (evidence: `package.json`, `postcss.config.mjs`, `app/globals.css`)

## Key Dependencies

**Critical:**
- `next@16.2.1` - app runtime and routing
- `react@19.2.4` + `react-dom@19.2.4` - rendering runtime
- `typescript@5.9.3` - strict type system (`strict: true` in `tsconfig.json`)
- `zod@4.3.6` - runtime input validation in actions/schemas (evidence: `lib/schemas/`, auth action imports)
- `@supabase/ssr@0.10.0` + `@supabase/supabase-js@2.99.0` - backend/auth integration

**Infrastructure:**
- `mqtt@5.15.1` - broker integration for cabinet open actions (evidence: `lib/actions/cabinets/open-with-mqtt.ts`)
- `next-themes@0.4.6` - theme management (evidence: `components/providers/theme-provider.tsx`, `app/layout.tsx`)
- `@tanstack/react-table@8.21.3` - tabular data UI (evidence: `components/tables/`)
- `date-fns@4.1.0` + `date-fns-tz@3.2.0` - date/time transformations (evidence: data and UI modules under `components/` and `lib/`)
- `recharts@3.8.0` - dashboard charting (evidence: `components/ui/chart.tsx`, admin dashboard modules)

## Configuration

**Environment:**
- Supabase URL/key are read from env at server, browser, and proxy boundaries (evidence: `lib/supabase/server.ts`, `lib/supabase/client.ts`, `lib/supabase/proxy.ts`)
- MQTT broker credentials are read from env in server action (evidence: `lib/actions/cabinets/open-with-mqtt.ts`)
- `.env.local` file exists in repo root and is expected for local environment configuration (contents intentionally not read)

**Build:**
- Next config enables React Compiler and browser-to-terminal logging (evidence: `next.config.mjs`)
- TypeScript uses strict mode and `@/*` path alias (evidence: `tsconfig.json`)
- ESLint flat config extends Next core-web-vitals + TypeScript presets with Prettier compatibility (evidence: `eslint.config.mjs`)
- PostCSS config uses Tailwind plugin (evidence: `postcss.config.mjs`)
- Shadcn component generator configured for Radix Nova style + aliases (evidence: `components.json`)

## Platform Requirements

**Development:**
- Local Node environment with npm available for scripts and tooling
- Supabase project credentials configured in local env
- Optional MQTT broker credentials configured when cabinet hardware publish flow is used

**Production:**
- Next.js server/runtime host with environment variable injection for Supabase and MQTT
- PostgreSQL/Auth/Realtime provided by Supabase backend
- Deployment provider configuration not explicitly committed (no `.github/workflows/*` CI pipeline files detected)

---

*Stack analysis: 2026-04-08*
