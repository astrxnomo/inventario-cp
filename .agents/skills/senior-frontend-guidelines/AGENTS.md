# Agent Instructions: senior-frontend-guidelines

## Task:

Review or implement advanced frontend features to maximize modularity, accessibility, and maintainability, especially in React/Next.js.

### Expected Inputs:

- Prompt referencing a complex component, layout, or advanced UI feature
- Optional: goals about accessibility or code structure

### Expected Outputs:

- SDD-OUTPUT JSON describing what patterns were used, files changed, and a11y/maintenance improvements

## SDD-OUTPUT example

```json
{
  "status": "success",
  "patterns": ["compound component", "accessible dialog"],
  "files": ["components/ui/tabs.tsx", "components/ui/dialog.tsx"],
  "accessibility": "Dialog has ARIA roles and focus trap.",
  "engram_topic_keys": [
    "sdd/senior-frontend-guidelines/spec",
    "sdd/senior-frontend-guidelines/apply-progress"
  ]
}
```

## Prompt/response example

Prompt:  
_"Refactor Tab UI for true compound component structure with keyboard support."_

Sample agent response:  
_"Split tabs into compound components in `components/ui/tabs.tsx` and ensured a11y as per guidelines."_

## Validation checks

- a11y evidence present for dialogs/complex UI
- Files point to modular/composable code
- SDD-OUTPUT patterns align with prompt
