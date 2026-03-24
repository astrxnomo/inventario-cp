# Skill: shadcn-usage

## Purpose
Defines how Shadcn UI components are used in this project, including import paths, component conventions, and common patterns.

---

## Configuration

Shadcn UI is configured in `components.json`:
- Style: `radix-nova`
- Base color: `mist`
- CSS variables: enabled
- Component alias: `@/components/ui`
- Icon library: `lucide`
- RSC: true

---

## Import Pattern

All Shadcn UI components are imported from `@/components/ui/<component-name>`:

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
```

---

## Commonly Used Components

### Button

```tsx
<Button type="submit" disabled={isPending}>
  {isPending && <Loader2 className="size-4 animate-spin" />}
  Guardar
</Button>

<Button variant="outline" size="sm">Cancelar</Button>
<Button variant="ghost" size="sm" asChild>
  <Link href="/admin/cabinets">Volver</Link>
</Button>
```

Variants: `default`, `outline`, `ghost`, `destructive`, `secondary`, `link`  
Sizes: `default`, `sm`, `lg`, `icon`

### Input

```tsx
<Input
  id="name"
  name="name"
  defaultValue={initialData?.name}
  placeholder="Nombre del gabinete"
  required
/>
```

### Label

```tsx
<Label htmlFor="name">Nombre</Label>
```

### Badge

```tsx
<Badge variant="outline">Sin ubicación</Badge>

{/* Status badge with custom colors */}
<Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-700">
  <Check className="mr-1 h-3 w-3" />
  Disponible
</Badge>
```

### Card

```tsx
<Card className="w-full max-w-sm">
  <CardHeader>
    <CardTitle>Iniciar sesión</CardTitle>
    <CardDescription>Ingresa tus credenciales.</CardDescription>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

### Dialog

```tsx
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Editar gabinete</DialogTitle>
    </DialogHeader>
    <CabinetForm onSuccess={() => setOpen(false)} onCancel={() => setOpen(false)} />
  </DialogContent>
</Dialog>
```

---

## Icons

Use `lucide-react` for all icons (configured as icon library):

```tsx
import { Loader2, Archive, Check, Lock, AlertTriangle, ArrowLeft } from "lucide-react"

<Loader2 className="size-4 animate-spin" />
<Archive className="h-4 w-4 text-muted-foreground" />
```

---

## SubmitButton Component

A project-specific submit button wrapping `useFormStatus`:

```tsx
import { SubmitButton } from "@/components/ui/submit-button"

<SubmitButton pendingText="Guardando…">Guardar</SubmitButton>
```

---

## Tailwind CSS v4 Conventions

- Use design tokens: `text-foreground`, `text-muted-foreground`, `text-destructive`, `bg-background`, `border-input`
- Use `space-y-*` for vertical spacing in forms
- Use `size-*` for square elements (`size-4` = `w-4 h-4`)
- Use `gap-*` for flex/grid gaps

---

## Conventions

- **Always** import components from `@/components/ui/<name>`, never from `shadcn/ui` directly.
- **Always** use `lucide-react` for icons.
- **Always** prefer Shadcn UI components over raw HTML elements (e.g. `<Button>` not `<button>`).
- **Never** override component styles with inline `style` — use Tailwind utility classes.
- Use `asChild` prop on `<Button>` when wrapping `<Link>` for navigation buttons.
