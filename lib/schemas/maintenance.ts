import { z } from "zod"

export const itemMaintenanceSchema = z.object({
  item_id: z.string().uuid("Debes seleccionar un item valido"),
  interval_days: z.coerce
    .number()
    .int("El intervalo debe ser un numero entero")
    .min(1, "El intervalo minimo es 1 dia")
    .max(3650, "El intervalo maximo es 3650 dias"),
  description: z.preprocess((value) => {
    if (typeof value !== "string") return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }, z.string().max(500, "La descripcion no debe exceder 500 caracteres").optional()),
})

export const maintenanceHistorySchema = z.object({
  maintenance_id: z.string().uuid("Mantenimiento invalido"),
  date: z.string().optional(),
})

export const maintenanceHistoryUpdateSchema = z
  .object({
    maintenance_id: z.string().uuid("Mantenimiento invalido").optional(),
    date: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.date) return true
      const parsed = Date.parse(data.date)
      return !Number.isNaN(parsed)
    },
    { message: "Fecha invalida", path: ["date"] },
  )
