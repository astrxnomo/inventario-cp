"use server"

import { reservationSchema } from "@/lib/schemas/reservations"
import { createClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types/cabinets"
import type { CreateReservationPayload } from "@/lib/types/reservations"

export async function createReservation(
  payload: CreateReservationPayload,
): Promise<ActionResult<string>> {
  const parsed = reservationSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("reserve_item", {
    p_item_id: payload.itemId,
    p_quantity: payload.quantity,
    p_starts_at: payload.startsAt,
    p_ends_at: payload.endsAt,
    p_note: payload.note,
  })

  if (error || !data) {
    return {
      data: null,
      error: error?.message ?? "No se pudo crear la reserva",
    }
  }

  return { data, error: null }
}
