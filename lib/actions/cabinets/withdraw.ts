"use server"

import { withdrawSchema } from "@/lib/schemas/cabinets"
import { createClient } from "@/lib/supabase/server"
import type { ActionResult, WithdrawPayload } from "@/lib/types/cabinets"

export async function withdrawCabinetItems(
  payload: WithdrawPayload,
): Promise<ActionResult<string>> {
  const parsed = withdrawSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    }
  }

  const supabase = await createClient()

  // Signal the physical cabinet (ESP32) to unlock.
  // Fire-and-forget: don't block the DB operation on the hardware signal.
  supabase
    .channel("esp32-commands")
    .send({
      type: "broadcast",
      event: "open",
      payload: { cabinet_id: payload.cabinetId },
    })
    .catch(() => {
      // Ignore broadcast failures — cabinet may not be connected
    })

  const { data, error } = await supabase.rpc("withdraw_items", {
    p_cabinet_id: payload.cabinetId,
    p_user_id: payload.userId,
    p_items: payload.items,
  })

  if (error || !data) {
    return { data: null, error: error?.message ?? "Error al retirar artículos" }
  }
  return { data, error: null }
}
