# Skill Registry – Intelligent Inventory

**Generated**: 2026-03-24  
**Project**: inventario-inteligente-app  
**Mode**: hybrid (engram + openspec)

---

## Project-Level Skills

### Curated Agent Skills (from AGENTS.md)
- **nextjs-16** – Next.js 16 patterns and best practices
- **nextjs-server-actions** – Server Actions integration
- **nextjs-data-fetching** – Data fetching patterns
- **supabase-auth-rls** – Supabase Auth and Row-Level Security
- **shadcn-usage** – Shadcn UI component patterns
- **senior-frontend-guidelines** – Frontend architecture and conventions
- **forms-zod** – Form validation with Zod
- **admin-tables** – Data tables and admin UI patterns

### Project Structure
- `.agents/skills/` – Location for project-specific curated skills (currently empty)
- `AGENTS.md` – Project conventions and skill registry index
- `.atl/skill-registry.md` – This file (infrastructure, always present)

---

## SDD Lifecycle

1. **Explore** (`/sdd-explore`) – Investigate requirements, clarify scope
2. **Propose** (`/sdd-propose`) – Create change proposal with intent
3. **Spec** (`/sdd-spec`) – Write detailed specifications and scenarios
4. **Design** (`/sdd-design`) – Create technical design document
5. **Tasks** (`/sdd-tasks`) – Break into implementation tasks
6. **Apply** (`/sdd-apply`) – Implement following specifications
7. **Verify** (`/sdd-verify`) – Validate against specs and design
8. **Archive** (`/sdd-archive`) – Finalize and commit changes

---

## Project Configuration

- **Stack**: Next.js 16, TypeScript, React 19, Tailwind CSS 4
- **Backend**: Supabase (Auth + Database)
- **UI**: Shadcn UI, Radix UI, custom components
- **Validation**: Zod 4.3
- **Linting**: ESLint 9, Prettier 3
- **Entry Point**: `openspec/config.yaml`

For skill details, see `AGENTS.md` and individual SKILL.md files.