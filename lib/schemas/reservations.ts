import { z } from "zod"

function refineDateRange(
  value: { startsAt: string; endsAt: string },
  ctx: z.RefinementCtx,
) {
  const start = new Date(value.startsAt)
  const end = new Date(value.endsAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return
  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha de fin debe ser posterior al inicio",
      path: ["endsAt"],
    })
  }
  if (start < new Date(Date.now() + 5 * 60 * 1000)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El inicio debe ser al menos 5 minutos en el futuro",
      path: ["startsAt"],
    })
  }
  if (end.getTime() - start.getTime() > 30 * 24 * 60 * 60 * 1000) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La reserva no puede superar 30 días",
      path: ["endsAt"],
    })
  }
}

export const reservationSchema = z
  .object({
    itemId: z.string().uuid("ID de artículo inválido"),
    quantity: z.number().int().min(1, "La cantidad debe ser al menos 1"),
    startsAt: z.string().datetime("Fecha de inicio inválida"),
    endsAt: z.string().datetime("Fecha de fin inválida"),
    note: z
      .string()
      .max(500, "La nota no puede superar 500 caracteres")
      .optional(),
  })
  .superRefine(refineDateRange)

export const groupReservationSchema = z
  .object({
    items: z
      .array(
        z.object({
          itemId: z.string().uuid("ID inválido"),
          quantity: z.number().int().min(1, "La cantidad debe ser al menos 1"),
        }),
      )
      .min(1, "Selecciona al menos un artículo"),
    startsAt: z.string().datetime("Fecha de inicio inválida"),
    endsAt: z.string().datetime("Fecha de fin inválida"),
    note: z
      .string()
      .max(500, "La nota no puede superar 500 caracteres")
      .optional(),
  })
  .superRefine(refineDateRange)

export const reservationAvailabilitySchema = z
  .object({
    itemId: z.string().uuid("ID de artículo inválido"),
    startsAt: z.string().datetime("Fecha de inicio inválida"),
    endsAt: z.string().datetime("Fecha de fin inválida"),
  })
  .superRefine((value, ctx) => {
    const start = new Date(value.startsAt)
    const end = new Date(value.endsAt)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de fin debe ser posterior al inicio",
        path: ["endsAt"],
      })
    }
  })

export type ReservationInput = z.infer<typeof reservationSchema>
export type GroupReservationInput = z.infer<typeof groupReservationSchema>
export type ReservationAvailabilityInput = z.infer<
  typeof reservationAvailabilitySchema
>

export const itemReservationRowSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  cabinet_id: z.string().uuid(),
  item_id: z.string().uuid(),
  user_id: z.string().uuid(),
  quantity: z.number().int(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  status: z.enum(["active", "cancelled", "completed", "expired"]),
  note: z.string().nullable(),
  cancelled_at: z.string().datetime().nullable(),
})
