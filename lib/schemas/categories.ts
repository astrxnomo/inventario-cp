import { z } from "zod"

// ─── Category CRUD (admin) ────────────────────────────────────────────────────
export const categoryNameSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
})
