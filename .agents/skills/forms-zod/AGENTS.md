# Agent Instructions: forms-zod

## Task:

Extend, implement, or review forms for robust validation and full type-safety using Zod in all user/admin forms.

### Expected Inputs:

- Prompt discussing a form component, schema, or validation issue
- Optional: new/modified fields or types needed

### Expected Outputs:

- SDD-OUTPUT JSON with details on forms/schemas changed, errors handled, and key files touched
- Example: types, error messages displayed in UI

## SDD-OUTPUT example

```json
{
  "status": "success",
  "forms": ["profile-form", "admin inventory edit-form"],
  "schemas": ["lib/schemas/users.ts", "lib/schemas/inventory.ts"],
  "errors_handled": true,
  "engram_topic_keys": ["sdd/forms-zod/spec", "sdd/forms-zod/apply-progress"]
}
```

## Prompt/response example

Prompt:  
_"Improve admin inventory form to surface all validation errors and sync schema with backend types."_

Sample agent response:  
_"Connected `lib/schemas/inventory.ts` to inventory form and provided inline error messaging on all fields as per Zod conventions."_

## Validation checks

- Form validation strictly matches Zod schema
- Output details key error handling
- SDD-OUTPUT cites forms and schemas touched
