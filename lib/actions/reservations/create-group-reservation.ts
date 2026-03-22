"use server"

import { createReservation } from "@/lib/actions/reservations/create-reservation"
import { groupReservationSchema } from "@/lib/schemas/reservations"
import { createClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/types/cabinets"
import type { CreateGroupReservationPayload } from "@/lib/types/reservations"

export async function createGroupReservation(
  payload: CreateGroupReservationPayload,
): Promise<ActionResult<string>> {
  const parsed = groupReservationSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    }
  }

  // Single-item shortcut — no group row needed
  if (payload.items.length === 1) {
    const item = payload.items[0]
    return createReservation({
      itemId: item.itemId,
      quantity: item.quantity,
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
      note: payload.note,
    })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: null, error: "No autenticado" }

  // 2. Create each individual reservation via RPC
  const createdIds: string[] = []
  for (const item of payload.items) {
    const { data: reservationId, error: rpcError } = await supabase.rpc(
      "reserve_item",
      {
        p_item_id: item.itemId,
        p_quantity: item.quantity,
        p_starts_at: payload.startsAt,
        p_ends_at: payload.endsAt,
        p_note: payload.note,
      },
    )

    if (rpcError || !reservationId) {
      for (const id of createdIds) {
        await supabase.rpc("cancel_reservation", { p_reservation_id: id })
      }
      return {
        data: null,
        error: rpcError?.message ?? "No se pudo crear una de las reservas",
      }
    }

    createdIds.push(reservationId)
  }

  // Return the first ID to satisfy the UI, or a generic string
  return { data: createdIds[0], error: null }
}
