import { z } from "zod"

// ─── Withdraw items ────────────────────────────────────────────────────────────
const withdrawItemSchema = z.object({
  item_id: z.string().uuid("ID de artículo inválido"),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1"),
})

export const withdrawSchema = z.object({
  cabinetId: z.string().uuid("ID de gabinete inválido"),
  userId: z.string().uuid("ID de usuario inválido"),
  items: z.array(withdrawItemSchema).min(1, "Selecciona al menos un artículo"),
})

// ─── Return all items ──────────────────────────────────────────────────────────
export const returnSchema = z.object({
  sessionId: z.string().uuid("ID de sesión inválido"),
  userId: z.string().uuid("ID de usuario inválido"),
})

// ─── Return single item ────────────────────────────────────────────────────────
export const returnSingleItemSchema = z.object({
  sessionId: z.string().uuid("ID de sesión inválido"),
  userId: z.string().uuid("ID de usuario inválido"),
  itemId: z.string().uuid("ID de artículo inválido"),
})

export type WithdrawInput = z.infer<typeof withdrawSchema>
export type ReturnInput = z.infer<typeof returnSchema>
export type ReturnSingleItemInput = z.infer<typeof returnSingleItemSchema>

// ─── Cabinet CRUD (admin) ─────────────────────────────────────────────────────
export const cabinetSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  location: z.string().optional(),
})

export type CabinetInput = z.infer<typeof cabinetSchema>
