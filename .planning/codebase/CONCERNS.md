# Codebase Concerns

**Analysis Date:** 2026-04-08

## Tech Debt

**Inconsistent authorization strategy across server actions:**
- Issue: Some mutations use `assertAdmin()` while others perform ad-hoc checks or no explicit role check in application code, creating policy drift and making authorization behavior hard to reason about.
- Files: `lib/actions/shared.ts`, `lib/actions/users/authorize-user.ts`, `lib/actions/users/delete-user.ts`, `lib/actions/users/update-user.ts`, `lib/actions/users/update-role.ts`
- Impact: Authorization correctness depends on RPC internals and route/UI assumptions instead of a single app-layer guard; future changes can accidentally expose privileged operations.
- Fix approach: Standardize privileged mutations on `assertAdmin()` (or a role-aware guard), then keep DB-level checks as defense-in-depth.

**Weak typing in data mapping paths (`any` proliferation):**
- Issue: Multiple data mappers cast relational payloads to `any`, reducing type safety despite strict TypeScript mode.
- Files: `lib/data/dashboard/get-dashboard.ts`, `lib/data/dashboard/get-admin-sidebar-counts.ts`, `lib/data/sessions/get-all-sessions.ts`, `lib/data/reservations/get-all-reservations.ts`, `lib/data/inventory/get-all-items.ts`, `lib/data/activity/get-access-logs.ts`, `lib/types/logs.ts`, `eslint.config.mjs`
- Impact: Schema drifts or null-shape changes can compile but fail at runtime; IDE and CI cannot reliably catch regressions.
- Fix approach: Replace `any` casts with generated Supabase row/select types and enable phased reduction of `@typescript-eslint/no-explicit-any` exemptions.

**Error handling returns ambiguous empty objects:**
- Issue: Many actions signal success as `return {}` and some catch blocks return raw `Error.message`, producing uneven API contracts.
- Files: `lib/actions/users/delete-user.ts`, `lib/actions/users/authorize-user.ts`, `lib/actions/users/update-user.ts`, `lib/actions/cabinets/delete-cabinet.ts`, `lib/actions/categories/delete-category.ts`
- Impact: UI and callers cannot consistently distinguish success states or classify errors for retry vs. user-facing validation.
- Fix approach: Adopt a unified action result type (for example `{ ok, errorCode, message }`) and normalize unknown errors.

## Known Bugs

**User deletion fallback can produce identity/profile inconsistency:**
- Symptoms: If RPC `delete_user` fails for reasons unrelated to profile existence, code still attempts direct profile deletion and can remove app profile while auth identity remains.
- Files: `lib/actions/users/delete-user.ts`
- Trigger: `delete_user` RPC returns any error, then fallback `.from("profiles").delete()` executes unconditionally.
- Workaround: None in app code; requires manual data reconciliation in Supabase.

**Partial-return flow is non-atomic and can leave inconsistent inventory/session state:**
- Symptoms: Inventory quantity can be incremented without matching return log insert (or vice versa if retries occur), causing stock drift and timeline mismatch.
- Files: `lib/actions/cabinets/return.ts`
- Trigger: Any failure between `inventory_items.update(...)` and `session_items.insert(...)` in `returnSingleItemWithQuantity`.
- Workaround: Prefer full-item return RPC path when possible (`return_single_item`) and manually reconcile inconsistent sessions/items.

**MQTT cabinet open path uses fixed topic constant:**
- Symptoms: Cabinet open requests are published to hardcoded topic `centro/a1`, regardless of cabinet context.
- Files: `lib/actions/cabinets/return.ts`, `lib/actions/cabinets/withdraw.ts`
- Trigger: Calling `openCabinetForReturn`; withdraw MQTT path is currently commented but carries same fixed topic.
- Workaround: None in code; requires code change to derive topic from cabinet/site metadata.

## Security Considerations

**Privileged mutations rely on DB/RPC policies without explicit app-layer role guard:**
- Risk: If RPC policy or RLS changes, actions lacking `assertAdmin()` can become privilege-escalation surfaces.
- Files: `lib/actions/users/authorize-user.ts`, `lib/actions/users/delete-user.ts`, `lib/actions/users/update-user.ts`, `lib/actions/users/update-role.ts`
- Current mitigation: Admin UI is under admin layout checks (`app/(admin)/layout.tsx`), and some checks exist in `update-role.ts`.
- Recommendations: Enforce role checks in every privileged server action; treat route/UI checks as UX only, not authorization.

**Raw backend error propagation to clients:**
- Risk: Returning raw DB/RPC error messages can leak internals (table, policy, or function details) and increase attack feedback quality.
- Files: `lib/actions/users/delete-user.ts`, `lib/actions/users/update-role.ts`, `lib/actions/cabinets/delete-cabinet.ts`, `lib/actions/categories/delete-category.ts`
- Current mitigation: None consistently applied; some actions normalize messages, many do not.
- Recommendations: Centralize error mapping to user-safe messages and log detailed errors server-side only.

## Performance Bottlenecks

**Dashboard path performs heavy fallback and duplicate maintenance computations:**
- Problem: On analytics RPC failure, code fetches full maintenance data and computes risk locally; sidebar counts then run a separate maintenance scan.
- Files: `lib/data/dashboard/get-dashboard.ts`, `lib/data/dashboard/get-admin-sidebar-counts.ts`
- Cause: Dual code paths with overlapping calculations and full-table reads.
- Improvement path: Consolidate maintenance KPIs in one RPC/query path, cache aggressively, and avoid full-row history sorting in request path.

**Server-side list endpoints use broad queries and weak pagination strategy:**
- Problem: Several endpoints fetch large result sets (or hard caps) with relation joins and then transform in memory.
- Files: `lib/data/sessions/get-all-sessions.ts`, `lib/data/reservations/get-all-reservations.ts`, `lib/data/activity/get-access-logs.ts`, `lib/data/inventory/get-all-items.ts`, `lib/data/users/get-all-users.ts`
- Cause: Mostly static `limit(200)`/`limit(500)` or no pagination plus post-query mapping.
- Improvement path: Move to cursor/page-based pagination, selective columns, and server-driven filters for date/status/search.

**Per-request MQTT connection setup:**
- Problem: Each cabinet open action creates a new MQTT client connection and TLS handshake.
- Files: `lib/actions/cabinets/open-with-mqtt.ts`, `lib/actions/cabinets/return.ts`
- Cause: No connection reuse or broker-side command queue abstraction.
- Improvement path: Introduce a durable broker publisher layer or job queue with pooled/reused connections.

## Fragile Areas

**Session return lifecycle spans multiple writes without transaction boundary:**
- Files: `lib/actions/cabinets/return.ts`
- Why fragile: Multi-step updates (`inventory_items`, `session_items`, optional `cabinet_sessions`) can fail mid-flow.
- Safe modification: Move logic to one SQL function/transaction and keep action as thin validation + RPC wrapper.
- Test coverage: No automated tests present for this edge-heavy path.

**Dashboard analytics data shape assumptions:**
- Files: `lib/data/dashboard/get-dashboard.ts`, `lib/data/dashboard/get-admin-sidebar-counts.ts`
- Why fragile: Extensive type assertions over RPC payloads and maintenance relation arrays increase runtime break risk when DB function output evolves.
- Safe modification: Version the RPC contract and add runtime schema validation (Zod) for returned analytics payloads.
- Test coverage: No integration tests validating RPC payload compatibility.

**Authorization logic split across layout, UI guards, and server actions:**
- Files: `app/(admin)/layout.tsx`, `components/admin/users/user-actions.tsx`, `lib/actions/users/*.ts`, `lib/actions/shared.ts`
- Why fragile: UI disable states and route redirects can diverge from mutation enforcement over time.
- Safe modification: Keep all hard authz checks in server actions and DB policies; keep UI constraints non-authoritative.
- Test coverage: No authorization regression test suite detected.

## Scaling Limits

**Hard-coded retrieval caps limit observability and admin operations growth:**
- Current capacity: Sessions/reservations capped at 200 rows and access logs at 500 rows per request.
- Limit: Historical analysis and admin workflows degrade as data volume grows; users cannot access full history via UI-backed queries.
- Scaling path: Add paginated APIs and index-backed filtering by date/user/status.

**Single MQTT topic routing model does not scale to multi-cabinet/multi-site:**
- Current capacity: One hardcoded topic (`centro/a1`) in active return flow.
- Limit: Cannot safely route commands per cabinet, floor, or center.
- Scaling path: Model cabinet-to-topic mapping in DB/config and publish dynamically per cabinet context.

## Dependencies at Risk

**MQTT integration robustness depends on environment and direct broker reachability:**
- Risk: Action fails hard when MQTT env vars are missing or broker is unreachable.
- Impact: Cabinet open workflow interruption for return flow.
- Migration plan: Add health checks/retries and a resilient queue/outbox pattern with operational monitoring.

## Missing Critical Features

**Automated test harness is absent:**
- Problem: Repository has no discovered `*.test.*`/`*.spec.*` files and no test runner scripts in package scripts.
- Blocks: Safe refactoring of critical auth, reservation, and inventory mutation flows; regression prevention relies on manual testing only.

## Test Coverage Gaps

**Authorization-sensitive server actions are untested:**
- What's not tested: Privilege escalation and role boundary behavior across user-management actions.
- Files: `lib/actions/users/authorize-user.ts`, `lib/actions/users/delete-user.ts`, `lib/actions/users/update-user.ts`, `lib/actions/users/update-role.ts`, `lib/actions/shared.ts`
- Risk: Silent authorization regressions can reach production.
- Priority: High

**Inventory/session consistency paths are untested:**
- What's not tested: Transactional correctness of withdraw/return flows under partial failures and concurrency.
- Files: `lib/actions/cabinets/withdraw.ts`, `lib/actions/cabinets/return.ts`
- Risk: Data drift between stock counts and session logs.
- Priority: High

**Dashboard analytics fallback behavior is untested:**
- What's not tested: Fallback branch correctness when analytics RPC fails and compatibility of expected payload shapes.
- Files: `lib/data/dashboard/get-dashboard.ts`, `lib/data/dashboard/get-admin-sidebar-counts.ts`
- Risk: Incorrect KPI rendering and hidden production failures.
- Priority: Medium

---

*Concerns audit: 2026-04-08*
