---
name: shadcn-usage
description: Usage conventions and customizations for Shadcn UI library components in this project.
user-invocable: true
allowed-tools: [Read, Glob, Grep, Bash]
version: 1.0
---

# Shadcn Usage – Project Skill

## Purpose

Establishes best practices for composing, theming, and extending Shadcn UI components, ensuring UI consistency and accessibility across the codebase.

## When to use this skill

- When building new UI or extending existing layout/forms using Shadcn
- When modifying theming, palette, or accessibility behavior in components
- When reviewing custom elements in `components/ui/` or `components/tables/`

## Quick Start Examples

1. **Compose a new admin table using Shadcn Table:**  
   See: `components/tables/data-table.tsx` used by admin screens.
2. **Override Shadcn Button for custom theme:**  
   Modify the classNames in `components/ui/button.tsx`.
3. **Integrate accessibility labels:**  
   Apply aria-attributes in `components/ui/dialog.tsx` and similar files.

## Common pitfalls and gotchas

- Removing essential ARIA roles when customizing Shadcn UI
- Breaking design token alignment by not following Tailwind config
- Duplicating Shadcn component logic instead of composing with existing ones

## Key files & engram topic_keys

- UI source: `components/ui/*.tsx`, Table: `components/tables/data-table.tsx`
- Theme: `components/ui/theme-toggle.tsx`
- Engram topic_keys:
  - `sdd/shadcn-usage/spec`
  - `sdd/shadcn-usage/apply-progress`
