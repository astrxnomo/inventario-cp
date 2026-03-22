"use server"

import { reservationAvailabilitySchema } from "@/lib/schemas/reservations"
import { createClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types/cabinets"
import type { ReservationAvailabilityPayload } from "@/lib/types/reservations"

export async function getReservationAvailability(
  payload: ReservationAvailabilityPayload,
): Promise<ActionResult<number>> {
  const parsed = reservationAvailabilitySchema.safeParse(payload)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_item_available_quantity", {
    p_item_id: payload.itemId,
    p_starts_at: payload.startsAt,
    p_ends_at: payload.endsAt,
  })

  if (error || data === null || data === undefined) {
    return {
      data: null,
      error: error?.message ?? "No se pudo calcular disponibilidad",
    }
  }

  return { data, error: null }
}
