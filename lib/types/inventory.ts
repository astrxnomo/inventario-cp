import { inventoryItemRowSchema } from "@/lib/schemas/inventory"
import { z } from "zod"

export type InventoryItemRow = z.infer<typeof inventoryItemRowSchema>

export type InventoryItem = {
  id: string
  cabinet_id: string
  name: string
  quantity: number
  category_id: string | null
  created_at: string
  updated_at: string
  // Join fields
  cabinet_name?: string
  category_name?: string
}
