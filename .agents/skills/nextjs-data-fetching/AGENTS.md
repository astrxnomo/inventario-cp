# Agent Instructions: nextjs-data-fetching

## Task:

Document, review, or refactor data-fetching logic in the context of Next.js RSC/SSR/ISR standards, optimizing for preloading, caching, and type safety.

### Expected Inputs:

- Prompt that mentions a data-related page/component/function
- Optional: reference to source file, data model, or target route/component

### Expected Outputs:

- SDD-OUTPUT JSON covering changes, affected files, caching or preloading strategy, and topic_keys touched
- Optionally, sample code/diff

## SDD-OUTPUT example

```json
{
  "status": "success",
  "changes": [
    "Added async dashboard loader with revalidation interval.",
    "Moved data source to lib/data/dashboard/get-dashboard.ts."
  ],
  "files": [
    "lib/data/dashboard/get-dashboard.ts",
    "app/(admin)/admin/dashboard/page.tsx"
  ],
  "engram_topic_keys": [
    "sdd/nextjs-data-fetching/spec",
    "sdd/nextjs-data-fetching/apply-progress"
  ]
}
```

## Prompt/response example

Prompt:  
_"Refactor cabinet browser for efficient data loading and client caching."_

Sample agent response:  
_"Switched to SWR and preloaded server data from `lib/data/cabinets/get-cabinets.ts` as per Next.js recommendations."_

## Validation checks

- All fetches in server components are typed
- Caching strategy mentioned in the output
- Engram keys reflect nextjs-data-fetching skill
