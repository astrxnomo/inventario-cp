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

  // const cabinetOpened = await openCabinetWithMqtt("centro/a1", {
  //   id: payload.cabinetLocation,
  // })

  // if (!cabinetOpened) {
  //   return { data: null, error: "Error al abrir el gabinete" }
  // }

  const supabase = await createClient()

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
