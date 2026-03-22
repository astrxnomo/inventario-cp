import { z } from "zod"

// ─── Category CRUD (admin) ────────────────────────────────────────────────────
export const categoryNameSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
})

export const categoryRowSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  name: z.string(),
})
