---
name: senior-frontend-guidelines
description: Advanced React and Next.js frontend patterns: composition, modularity, performance, and accessibility.
user-invocable: true
allowed-tools: [Read, Glob, Grep, Bash]
version: 1.0
---

# Senior Frontend Guidelines – Project Skill

## Purpose

Details mature, scalable frontend practices for React and Next.js, covering code organization, accessibility, and modern composition patterns.

## When to use this skill

- Creating complex UI or architecting large features/components
- Reviewing code for accessibility (a11y), performance, or maintainability
- Refactoring existing components for composability

## Quick Start Examples

1. **Implement a compound component:**  
   Create/consult `components/ui/tabs.tsx` and related children for the compound pattern.
2. **Enforce accessibility in custom dialogs:**  
   See `components/ui/dialog.tsx` using ARIA and focus management.
3. **Apply modular CSS with Tailwind:**  
   Check `app/globals.css` in component classes for Tailwind utility use.

## Common pitfalls and gotchas

- Skipping a11y checks, missing keyboard/focus support
- Letting props/context/logic sprawl (unmodular)
- Not using composition (i.e., too many boolean flags)

## Key files & engram topic_keys

- Compound: `components/ui/tabs.tsx`, `components/ui/dialog.tsx`
- Modular: `components/layout/app-sidebar.tsx`, `app/globals.css`
- Engram topic_keys:
  - `sdd/senior-frontend-guidelines/spec`
  - `sdd/senior-frontend-guidelines/apply-progress`
