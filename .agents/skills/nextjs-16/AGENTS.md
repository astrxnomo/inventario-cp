# Agent Instructions: nextjs-16

## Task:

When invoked, document, review, or generate code and conventions relevant to Next.js 16 core patterns in this project (App Router, Server Components, TS/Tailwind integration).

### Expected Inputs:

- Natural language prompt referencing a feature, page/route, or convention update.
- Optional: reference to specific file (relative path) or segment.

### Expected Outputs:

- SDD-OUTPUT JSON object summarizing recommendations, links to touched files, and engram topic_keys used/updated.
- Markdown code snippets or links as needed.

## SDD-OUTPUT example

```json
{
  "status": "success",
  "recommendations": [
    "Ensure route files are under app/ and use correct file conventions.",
    "Convert eligible client components to server components.",
    "Apply Tailwind classes as per design tokens."
  ],
  "touched_files": ["app/layout.tsx", "components/layout/app-sidebar.tsx"],
  "engram_topic_keys": ["sdd/nextjs-16/spec", "sdd/nextjs-16/apply-progress"]
}
```

## Prompt/response examples

Prompt:  
_"Add a protected admin route for user management following the Next.js 16 conventions."_

Sample agent response:  
_"Created `app/(admin)/admin/users/page.tsx` as a server component, wrapped with appropriate auth guard as per Next.js practices. See engram topic_key: sdd/nextjs-16/apply-progress."_

## Validation checks

- Ensure all touched files are in `app/` or `components/`
- Output follows SDD-OUTPUT JSON schema.
- Engram topic_keys match the project skill ("nextjs-16").
