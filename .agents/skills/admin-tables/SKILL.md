# Skill: admin-tables

## Purpose
Defines how admin data tables are built in this project using TanStack Table (via Shadcn UI DataTable), column definitions, filtering, and row actions.

---

## File Structure

Each domain that has an admin table has these files:

```
components/admin/<domain>/
├── columns.tsx      # ColumnDef array + row action components
├── table.tsx        # DataTable wrapper (Client Component)
└── form.tsx         # Create/edit form (used in dialogs)
```

---

## Column Definition Pattern (`columns.tsx`)

```tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/tables/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import type { MyItem } from "@/lib/types/my-domain"

export const myColumns: ColumnDef<MyItem>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <Badge variant="outline">{status}</Badge>
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <MyItemActions item={row.original} />,
  },
]
```

---

## Row Actions Pattern

Row actions (edit/delete) are encapsulated in a small Client Component inside `columns.tsx`:

```tsx
function MyItemActions({ item }: { item: MyItem }) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  return (
    <>
      <ActionButtonsRow
        onEdit={() => setShowEditDialog(true)}
        onDelete={() => deleteItem(item.id)}
        deleteDescription={
          <>Esta acción eliminará "{item.name}" de forma permanente.</>
        }
      />
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar item</DialogTitle>
          </DialogHeader>
          <MyItemForm
            initialData={item}
            isDialog
            onSuccess={() => setShowEditDialog(false)}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
```

`ActionButtonsRow` is a shared component in `components/admin/action-buttons-row.tsx` that renders edit and delete buttons with a confirm-before-delete dialog.

---

## Table Wrapper Pattern (`table.tsx`)

```tsx
"use client"

import { DataTable } from "@/components/tables/data-table"
import { myColumns } from "./columns"
import type { MyItem } from "@/lib/types/my-domain"

interface MyTableProps {
  items: MyItem[]
}

export function MyItemsTable({ items }: MyTableProps) {
  return (
    <DataTable
      columns={myColumns}
      data={items}
      searchKey="name"
      searchPlaceholder="Buscar por nombre..."
    />
  )
}
```

---

## Status Badge Patterns

Standard status badge styles used across all admin tables:

```tsx
// Available / Active — green
<Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-700">
  <Check className="mr-1 h-3 w-3" /> Disponible
</Badge>

// Warning / In Use — amber
<Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-700">
  <AlertTriangle className="mr-1 h-3 w-3" /> En uso
</Badge>

// Danger / Locked / Cancelled — red
<Badge variant="outline" className="border-red-500/20 bg-red-500/10 text-red-700">
  <Lock className="mr-1 h-3 w-3" /> Bloqueado
</Badge>

// Neutral — default outline
<Badge variant="outline">{value}</Badge>
```

---

## Date Formatting

Use `formatDate` from `lib/utils.ts`:

```tsx
import { formatDate } from "@/lib/utils"

cell: ({ row }) => (
  <span className="text-muted-foreground">
    {formatDate(new Date(row.getValue("created_at")), "d MMM yyyy")}
  </span>
)
```

---

## Filter Options Pattern

Define filter options as a constant array for faceted filters:

```ts
export const statusOptions = [
  { label: "Disponible", value: "available", icon: Check },
  { label: "En uso",     value: "in_use",    icon: AlertTriangle },
  { label: "Bloqueado",  value: "locked",    icon: Lock },
]
```

Set `filterFn: (row, id, value) => value.includes(row.getValue(id))` on the column.

---

## Conventions

- **Always** put column definitions in `columns.tsx`, not in the table wrapper.
- **Always** use `DataTableColumnHeader` for sortable column headers.
- **Always** inline row action components in `columns.tsx` (not in separate files).
- **Always** use `ActionButtonsRow` for edit/delete row actions.
- **Always** confirm before delete — use `ActionButtonsRow`'s built-in confirmation dialog.
- **Never** put data fetching inside table components — receive data as props.
- Column files are Client Components (`"use client"`) because they use `useState` in row actions.
- Table wrapper files are also Client Components due to TanStack Table requirements.
