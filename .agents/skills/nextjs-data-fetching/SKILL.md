---
name: nextjs-data-fetching
description: Patterns and best practices for data retrieval in Next.js: RSC, SSR, ISR, SWR, and caching.
user-invocable: true
allowed-tools: [Read, Glob, Grep, Bash]
version: 1.0
---

# Next.js Data Fetching – Project Skill

## Purpose

Standardizes data-fetching logic for local and remote sources in RSC/SSR/ISR using Next.js 16+, including optimal caching and preloading approaches.

## When to use this skill

- Adding database or API-backed features in `app/` or `lib/data/`
- Refactoring from client-side fetching (fetch/SWR) to server-driven patterns
- Ensuring data is type-safe and consistent across UI

## Quick Start Examples

1. **Add SSR data loader for admin dashboard:**  
   Implement async data fetch from `lib/data/dashboard/get-dashboard.ts` in `app/(admin)/admin/dashboard/page.tsx`.
2. **Preload cabinet list for client with SWR pattern:**  
   Integrate `lib/data/cabinets/get-cabinets.ts` and client cache in `components/cabinets/browse-list.tsx`.
3. **Use ISR for slow-changing data:**  
   Set revalidation time in `app/(admin)/admin/categories/page.tsx`.

## Common pitfalls and gotchas

- Overfetching data on the client when server could provide it in one render
- Forgetting to type all fetch results (strict null/undefined handling)
- Misconfiguring revalidation or SWR cache keys

## Key files & engram topic_keys

- `lib/data/`, e.g., `lib/data/dashboard/`, `lib/data/cabinets/`
- Key usage: `app/(admin)/admin/dashboard/page.tsx`, `components/cabinets/browse-list.tsx`
- Engram topic_keys:
  - `sdd/nextjs-data-fetching/spec`
  - `sdd/nextjs-data-fetching/apply-progress`
