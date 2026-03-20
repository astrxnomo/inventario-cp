import {
  groupReservationSchema,
  reservationAvailabilitySchema,
  reservationSchema,
} from "@/lib/schemas/reservations"
import { createClient } from "@/lib/supabase/client"
import type { ActionResult } from "@/lib/types/cabinets"
import type {
  CreateGroupReservationPayload,
  CreateReservationPayload,
  ReservationAvailabilityPayload,
} from "@/lib/types/reservations"

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

  const supabase = createClient()
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

  const supabase = createClient()
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

export async function cancelReservation(
  reservationId: string,
): Promise<{ error?: string }> {
  if (!reservationId) return { error: "Reserva inválida" }

  const supabase = createClient()
  const { error } = await supabase.rpc("cancel_reservation", {
    p_reservation_id: reservationId,
  })

  if (error) return { error: error.message }
  return {}
}

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

  const supabase = createClient()
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
