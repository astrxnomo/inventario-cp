---
name: admin-tables
description: Features, conventions, and best practices for robust admin datatables (filtering, pagination, server-driven, type-safe).
user-invocable: true
allowed-tools: [Read, Glob, Grep, Bash]
version: 1.0
---

# Admin Tables – Project Skill

## Purpose

Defines proven patterns for building interactive, type-safe datatables supporting all admin activities—filter, paginate, customize columns, and fetch server data robustly.

## When to use this skill

- Extending/administering any data table in `components/tables/` or admin pages in `app/(admin)/`
- Adding features such as filtering, server-side paging, custom actions to datatables
- Reviewing table logic or fixing bugs/UI gaps in admin dashboards

## Quick Start Examples

1. **Implement server-driven pagination in a data table:**  
   See `components/tables/data-table-pagination.tsx` and its use in `components/admin/inventory/table.tsx`.
2. **Add column-level filters to users table:**  
   Reference `components/admin/users/columns.tsx` for defining filterable headers.
3. **Customize action buttons in admin datatable:**  
   Consult `components/admin/action-buttons-row.tsx` in combination with main table code.

## Common pitfalls and gotchas

- Over-fetching data on the client instead of paginating/filtering in SQL
- Accidentally breaking table typing when modifying columns/data structure
- Implementing duplicate table logic for similar admin views

## Key files & engram topic_keys

- Table infra: `components/tables/data-table.tsx`, Pagination: `components/tables/data-table-pagination.tsx`
- Example usages: `components/admin/inventory/table.tsx`, `components/admin/users/table.tsx`
- Engram topic_keys:
  - `sdd/admin-tables/spec`
  - `sdd/admin-tables/apply-progress`
