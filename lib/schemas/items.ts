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
