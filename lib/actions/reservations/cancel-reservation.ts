"use server"

import { createClient } from "@/lib/supabase/server"

export async function cancelReservation(
  reservationId: string,
): Promise<{ error?: string }> {
  if (!reservationId) return { error: "Reserva inválida" }

  const supabase = await createClient()
  const { error } = await supabase.rpc("cancel_reservation", {
    p_reservation_id: reservationId,
  })

  if (error) return { error: error.message }
  return {}
}
