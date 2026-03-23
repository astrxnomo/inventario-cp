# Agent Instructions: admin-tables

## Task:

Develop, refactor, or assess admin datatables to maximize type safety, modularity, and performance using robust filtering, pagination, and custom actions.

### Expected Inputs:

- Prompt referencing an admin view, table, or data management feature
- Optional: requirements for filters, actions, or server-driven updates

### Expected Outputs:

- SDD-OUTPUT JSON listing table features implemented, columns/actions changed, files touched, key topic_keys

## SDD-OUTPUT example

```json
{
  "status": "success",
  "tables": ["inventory", "users"],
  "features": ["server-pagination", "column filters"],
  "files": [
    "components/admin/inventory/table.tsx",
    "components/tables/data-table-pagination.tsx"
  ],
  "engram_topic_keys": [
    "sdd/admin-tables/spec",
    "sdd/admin-tables/apply-progress"
  ]
}
```

## Prompt/response example

Prompt:  
_"Add server-driven filtering and a custom action column to user admin table."_

Sample agent response:  
_"Extended `components/admin/users/table.tsx` with new filters and a bulk action column by refactoring table column definitions and pagination logic."_

## Validation checks

- Table/column typing is preserved in output
- Output lists changes/features per prompt
- SDD-OUTPUT lists touched table-related files
