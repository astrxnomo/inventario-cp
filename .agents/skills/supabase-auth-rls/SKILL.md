---
name: supabase-auth-rls
description: Standardizes secure authentication using Supabase Auth and Row-Level Security (RLS) controls.
user-invocable: true
allowed-tools: [Read, Glob, Grep, Bash]
version: 1.0
---

# Supabase Auth + RLS – Project Skill

## Purpose

Ensure all authentication and authorization flows are secure, robust, and follow best practices for Supabase integration and Row Level Security enforcement.

## When to use this skill

- When implementing new user auth flows or session management
- When enforcing or reviewing RLS policies on tables
- When updating endpoints relying on Supabase user context

## Quick Start Examples

1. **Add Supabase Auth to a route:**  
   See `lib/supabase/get-current-user.ts` for user context in API routes.
2. **Write an RLS policy migration:**  
   Document table policies in `database/migrations/` scripts.
3. **Restrict UI by permission:**  
   Use session values in `components/layout/user-menu.tsx` to change available links.

## Common pitfalls and gotchas

- Missing or misapplied RLS policies leave data exposed
- Hardcoding admin logic instead of database-driven rules
- Not handling expired or invalid session tokens gracefully

## Key files & engram topic_keys

- Auth logic: `lib/supabase/get-current-user.ts`, UI: `components/layout/user-menu.tsx`
- Migration samples: `database/migrations/`
- Engram topic_keys:
  - `sdd/supabase-auth-rls/spec`
  - `sdd/supabase-auth-rls/apply-progress`
