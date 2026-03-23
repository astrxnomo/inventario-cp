# Agent Instructions: shadcn-usage

## Task:

Implement or review UI code using Shadcn, focusing on alignment with Tailwind, composition best practices, and accessibility requirements.

### Expected Inputs:

- Prompts about UI component creation, theming, or accessibility review
- Optional: affected files, requirements for custom theme/interactivity

### Expected Outputs:

- SDD-OUTPUT JSON enumerating component changes, affected files, accessibility compliance notes, and updated topic_keys

## SDD-OUTPUT example

```json
{
  "status": "success",
  "ui_components": ["button", "table", "dialog"],
  "files": ["components/ui/button.tsx", "components/tables/data-table.tsx"],
  "a11y_notes": "Added aria-label to Dialog and ensured focus trap present.",
  "engram_topic_keys": [
    "sdd/shadcn-usage/spec",
    "sdd/shadcn-usage/apply-progress"
  ]
}
```

## Prompt/response example

Prompt:  
_"Customize the Table for admin with sorting/filter buttons themed for dark mode."_

Sample agent response:  
_"Extended `components/tables/data-table.tsx` with dark theme classes and button overrides per shadcn/ui docs."_

## Validation checks

- Accessibility requirements checked in UI code
- Shadcn composition used (no copy-paste duplication)
- SDD-OUTPUT mentions a11y and theme alignment
