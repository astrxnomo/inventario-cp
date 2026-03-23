---
name: nextjs-16
description: Conventions and practices for Next.js 16+ projects, with focus on App Router, server components, TS, and Tailwind.
user-invocable: true
allowed-tools: [Read, Glob, Grep, Bash]
version: 1.0
---

# Next.js 16 – Project Skill

## Purpose

Defines key conventions and patterns for working with Next.js 16+ in this repository, ensuring implementation consistency in routing, server/client boundaries, and UI structure.

## When to use this skill

- When creating or modifying pages and layouts in `app/`
- When implementing or reviewing React Server Components (RSC)
- When updating project-wide configuration (app/layout, root providers)
- When onboarding new features that should follow App Router conventions

## Quick Start Examples

1. **Create a dynamic route using file conventions:**  
   See: `app/history/[id]/page.tsx`
2. **Migrate a client component to a server component:**  
   Refactor UI from `components/history/session-history-table.tsx` to reduce "use client" scope.
3. **Integrate Tailwind with Next.js Layout:**  
   Use Tailwind classes inside `app/layout.tsx` for consistent design.

## Common pitfalls and gotchas

- Forgetting to add `use client` directive to components that need browser interactivity.
- Mixing data fetching logic in client components instead of server components.
- Not updating imports when moving files between segments.

## Key files & engram topic_keys

- `app/layout.tsx`, `app/page.tsx`
- `components/layout/app-sidebar.tsx`, `components/layout/app-nav.tsx`
- Engram topic_keys:
  - `sdd/nextjs-16/spec`
  - `sdd/nextjs-16/design`
