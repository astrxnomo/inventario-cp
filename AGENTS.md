# Intelligent Inventory – AGENTS.md

This file documents conventions and practices for AI agents working within this repository, following the curated project skills approach.

## Project Overview & Stack

- **Stack:** Next.js 16+, TypeScript, Tailwind CSS v4, Supabase (Auth & Database), Shadcn UI
- **Purpose:** Provide a scalable, maintainable inventory system with clear agent automation and conventions.

## Core Conventions

- **Server Components** by default; use `use client` only for interactivity.
- **Validation:** Use Zod for type and input validation.
- **Security:** Never commit secrets; enforce Supabase RLS.
- **Commits:** Use [Conventional Commits](https://www.conventionalcommits.org/).
- **Testing:** Run `tsc` and linter before each commit.

## Agent Skills & Skill Registry

- Skills are stored in `.agents/skills/<skill-name>/SKILL.md`.
- See `.agents/skills/registry.json` for a machine-readable listing of all curated skills.
- To reference or extend a skill, consult the respective SKILL.md or registry entry.
- Skills should be project-specific, following patterns and conventions agreed upon in this documentation.

## Skills Lifecycle & Usage

1. **Curated Only:** Only the listed, maintained skills are to be referenced by agents or humans.
2. **Update Protocol:** Additions and changes must be reflected in `registry.json` and relevant SKILL.md files.
3. **Skill Documentation:** Each SKILL.md contains usage patterns, do's/don'ts, and key conventions.

## Migration & Deletion Policy

- **Legacy skills** under `.agents/skills/` are _not_ deleted by default.
- To permanently remove legacy skills, a _manual confirmation token_ must be provided by maintainers, recorded in a PR comment or issue with this exact format:

  `CONFIRM DELETE SKILLS <branch-or-commit-sha> <user>`

- See `migration_plan.md` for detailed steps, safety notes, and backup procedures.

## Curated Agent Skills (as of migration)

- nextjs-16
- nextjs-server-actions
- nextjs-data-fetching
- supabase-auth-rls
- shadcn-usage
- senior-frontend-guidelines
- forms-zod
- admin-tables

For details or to contribute, see each `.agents/skills/<skill>/SKILL.md` and the registry for up-to-date status.
