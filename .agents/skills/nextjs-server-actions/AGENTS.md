# Agent Instructions: nextjs-server-actions

## Task:

Implement, review, or refactor server actions for secure, type-safe, and user-friendly operation in Next.js 16+ (see usage in `lib/actions/` and route files).

### Expected Inputs:

- Prompt referencing a mutation or action scenario (e.g., create, update, delete, login)
- Optional: reference to failure-handling or validation requirements

### Expected Outputs:

- SDD-OUTPUT JSON documenting action location, validation steps, and engram topic_keys updated
- Example action code snippet when relevant

## SDD-OUTPUT example

```json
{
  "status": "success",
  "actions": [
    "Added Zod validation to new create-inventory-item server action.",
    "Refactored login logic to ensure pure action boundary."
  ],
  "files": [
    "lib/actions/inventory/create-inventory-item.ts",
    "lib/actions/auth/login.ts"
  ],
  "engram_topic_keys": [
    "sdd/nextjs-server-actions/spec",
    "sdd/nextjs-server-actions/apply-progress"
  ]
}
```

## Prompt/response example

Prompt:  
_"Build a safe inventory creation action with Zod validation and proper error handling."_

Sample agent response:  
_"Added schema validation in `lib/actions/inventory/create-inventory-item.ts`, returning error messages for invalid payloads as per best practices."_

## Validation checks

- Server action implements explicit validation
- SDD-OUTPUT JSON includes touched action files
- Engram keys reflect server-actions skill
