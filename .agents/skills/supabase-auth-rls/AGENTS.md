# Agent Instructions: supabase-auth-rls

## Task:

Design, implement, or review authentication and authorization using Supabase Auth and RLS in this project, ensuring all flows are secure and match data protection standards.

### Expected Inputs:

- Prompts addressing login, registration, protected route, or RLS needs
- Optional: migration, user context, or auth/session ref

### Expected Outputs:

- SDD-OUTPUT JSON with updated tables, changed files, and RLS logic explained
- Migration or code sample if changed

## SDD-OUTPUT example

```json
{
  "status": "success",
  "tables_secured": ["users", "reservations"],
  "files": [
    "lib/supabase/get-current-user.ts",
    "database/migrations/20240101_rls.sql"
  ],
  "rls_details": "Added row-level security to reservations; now filtered by user_id.",
  "engram_topic_keys": [
    "sdd/supabase-auth-rls/spec",
    "sdd/supabase-auth-rls/apply-progress"
  ]
}
```

## Prompt/response example

Prompt:  
_"Add RLS to reservations so users only access their own."_

Sample agent response:  
_"Created migration in database/migrations/20240101_rls.sql and enforced filtering in relevant queries."_

## Validation checks

- All auth flows pass through Supabase Auth
- Any table access updates RLS policy/migration
- Output references key files and tables
