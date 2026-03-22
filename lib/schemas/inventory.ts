import { z } from "zod"

// ─── Inventory item CRUD (admin) ──────────────────────────────────────────────
export const inventoryItemSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  quantity: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "La cantidad debe ser al menos 1"),
  category_id: z.string().min(1, "La categoría es requerida"),
})

export type InventoryItemInput = z.infer<typeof inventoryItemSchema>

export const inventoryItemRowSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  name: z.string(),
  quantity: z.number().int(),
  cabinet_id: z.string().uuid(),
  category_id: z.string().uuid(),
})
