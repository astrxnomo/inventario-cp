---
name: nextjs-server-actions
description: Next.js server actions patterns for secure, scalable server-driven logic and mutation.
user-invocable: true
allowed-tools: [Read, Glob, Grep, Bash]
version: 1.0
---

# Next.js Server Actions – Project Skill

## Purpose

Provide guidelines and examples for implementing secure, validated, and maintainable server actions in Next.js 16+, including pure function boundaries and error management.

## When to use this skill

- When creating or modifying actions in `lib/actions/` or as direct server actions in route files
- When converting API routes or legacy client logic into new server actions
- When reviewing server-side data mutations for correctness

## Quick Start Examples

1. **Add a new server action in a route file:**  
   Use `export async function action() {...}` in `app/(admin)/admin/inventory/page.tsx`.
2. **Centralize validation with Zod:**  
   See: `lib/actions/inventory/create-inventory-item.ts`.
3. **Handle errors with proper response codes:**  
   Implement error responses as demonstrated in `lib/actions/auth/login.ts`.

## Common pitfalls and gotchas

- Missing schema validation may introduce vulnerabilities
- Forgetting to keep actions pure (side-effects in helpers instead)
- Not surfacing user-friendly error messages to the client

## Key files & engram topic_keys

- `lib/actions/`, e.g., `lib/actions/inventory/`, `lib/actions/auth/`
- Example route usage: `app/(admin)/admin/inventory/page.tsx`
- Engram topic_keys:
  - `sdd/nextjs-server-actions/spec`
  - `sdd/nextjs-server-actions/apply-progress`
