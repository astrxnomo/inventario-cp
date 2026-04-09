# External Integrations

**Analysis Date:** 2026-04-08

## APIs & External Services

**Backend Platform (BaaS):**
- Supabase - Primary external backend for auth, database access, and realtime messaging
  - SDK/Client: `@supabase/ssr`, `@supabase/supabase-js` (evidence: `package.json`)
  - Auth: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (evidence: `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/proxy.ts`)
  - Integration points:
    - Browser client creation (`lib/supabase/client.ts`)
    - Server client creation with cookies (`lib/supabase/server.ts`)
    - Session-refresh proxy middleware path (`proxy.ts`, `lib/supabase/proxy.ts`)
    - OAuth/email callback token exchange (`app/(auth)/auth/callback/route.ts`)

**IoT Messaging:**
- HiveMQ-compatible MQTT broker - Cabinet open/actuation command publish from server actions
  - SDK/Client: `mqtt` (evidence: `package.json`, `lib/actions/cabinets/open-with-mqtt.ts`)
  - Auth: `HIVEMQTT_BROKER_URL`, `HIVEMQTT_USERNAME`, `HIVEMQTT_PASSWORD` (evidence: `lib/actions/cabinets/open-with-mqtt.ts`)
  - Notes: Uses `mqtts` on port 8883 with timeout/error handling (evidence: `lib/actions/cabinets/open-with-mqtt.ts`)

**Developer Tooling Integration (non-runtime app flow):**
- Supabase MCP remote endpoint for AI/dev tooling
  - Config location: `opencode.json`
  - Endpoint type: Remote MCP URL (contains project ref and enabled capabilities)

## Data Storage

**Databases:**
- PostgreSQL via Supabase
  - Connection: URL + publishable key from env vars (evidence: `lib/supabase/client.ts`, `lib/supabase/server.ts`)
  - Client: Supabase JS client wrappers (`createBrowserClient`, `createServerClient`)
  - Type layer: generated Supabase types re-exported through `lib/supabase/types.ts`

**File Storage:**
- Not detected in application code (no `supabase.storage` usage found in app/lib/components files)

**Caching:**
- No external cache service detected (Redis/Memcached not detected in dependencies)
- In-process React cache used for current-user fetch path (`cache(...)`) (evidence: `lib/supabase/get-current-user.ts`)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Implementation: Session cookies + server/browsers clients + callback exchange flow
  - Password login: `supabase.auth.signInWithPassword` (`lib/actions/auth/login.ts`)
  - Registration: `supabase.auth.signUp` with email redirect callback (`lib/actions/auth/register.ts`)
  - Password reset email: `supabase.auth.resetPasswordForEmail` with callback redirect (`lib/actions/auth/reset-password.ts`)
  - Session callback exchange: `supabase.auth.exchangeCodeForSession` (`app/(auth)/auth/callback/route.ts`)
  - Session continuity/guard: `supabase.auth.getClaims` in request proxy (`lib/supabase/proxy.ts`)

## Monitoring & Observability

**Error Tracking:**
- No third-party error tracking integration detected (Sentry/Bugsnag/etc. not found in dependencies)

**Logs:**
- Next.js browser-to-terminal logging enabled (evidence: `next.config.mjs`)
- Action-level logging via `console.log` in MQTT publish flow (evidence: `lib/actions/cabinets/open-with-mqtt.ts`)

## CI/CD & Deployment

**Hosting:**
- Hosting provider not explicitly configured in repository files
- Project shape and scripts are compatible with standard Next.js hosts (evidence: `package.json`, `next.config.mjs`)

**CI Pipeline:**
- None detected (`.github/workflows/*` not present)

## Environment Configuration

**Required env vars:**
- Runtime-observed in code:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `HIVEMQTT_BROKER_URL`
  - `HIVEMQTT_USERNAME`
  - `HIVEMQTT_PASSWORD`
- Additionally documented in project guidance:
  - `SUPABASE_SERVICE_ROLE_KEY` (documented, not referenced in app runtime files scanned) (evidence: `AGENTS.md`)

**Secrets location:**
- Local secrets expected in `.env.local` (file exists; contents intentionally not read)
- Runtime secrets are consumed through `process.env` in server/client wrappers and server actions

## Webhooks & Callbacks

**Incoming:**
- Auth callback endpoint: `/auth/callback` route handler in App Router
  - File: `app/(auth)/auth/callback/route.ts`
  - Function: exchanges Supabase auth code for session and redirects to next path

**Outgoing:**
- Supabase email callback URLs are generated and passed during auth flows:
  - Register email redirect: `${origin}/auth/callback` (`lib/actions/auth/register.ts`)
  - Reset password redirect: `${origin}/auth/callback?next=/reset-password/update` (`lib/actions/auth/reset-password.ts`)
- No outbound webhook producer integration detected in runtime code

---

*Integration audit: 2026-04-08*
