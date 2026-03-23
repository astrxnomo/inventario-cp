---
name: forms-zod
description: Form validation and type-safe schema handling using Zod in React/Next.js applications.
user-invocable: true
allowed-tools: [Read, Glob, Grep, Bash]
version: 1.0
---

# Forms + Zod – Project Skill

## Purpose

Standardizes robust, type-safe form validation with Zod, supporting schema inference and tight type integration in all React/Next.js forms.

## When to use this skill

- Building new forms or input validation for APIs/routes
- Refactoring legacy forms for better error handling/type safety
- Creating or updating Zod schemas in `lib/schemas/`

## Quick Start Examples

1. **Build a profile form with Zod validation:**  
   Use `lib/schemas/users.ts` and connect with `components/profile/profile-form.tsx`.
2. **Enforce validation in an admin inventory form:**  
   See `lib/schemas/inventory.ts` and form-linked error display in `components/admin/inventory/edit-form.tsx`.
3. **Use schema inference for type-safety:**  
   Example provided in `lib/schemas/categories.ts` used by admin category forms.

## Common pitfalls and gotchas

- Restructuring forms but not keeping validation in sync with schema
- Not surfacing detailed error messages to end users
- Missing inference step, causing type drift between schema and usage

## Key files & engram topic_keys

- Schemas: `lib/schemas/`, Forms: `components/profile/profile-form.tsx`, `components/admin/inventory/edit-form.tsx`
- Engram topic_keys:
  - `sdd/forms-zod/spec`
  - `sdd/forms-zod/apply-progress`
