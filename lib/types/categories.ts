import { categoryRowSchema } from "@/lib/schemas/categories"
import { z } from "zod"

// ─── Inventory categories ─────────────────────────────────────────────────────
export type CategoryRow = z.infer<typeof categoryRowSchema>
export interface Category {
  id: string
  name: string
  _count?: {
    inventory_items: number
  }
}
