"use server"

import { returnSchema, returnSingleItemSchema } from "@/lib/schemas/cabinets"
import { createClient } from "@/lib/supabase/server"
import type {
  ActionResult,
  ReturnPayload,
  ReturnSingleItemPayload,
} from "@/lib/types/cabinets"

export async function returnCabinetItems(
  payload: ReturnPayload,
): Promise<ActionResult<void>> {
  const parsed = returnSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc("return_items", {
    p_session_id: payload.sessionId,
    p_user_id: payload.userId,
  })

  if (error) return { data: null, error: error.message }
  return { data: undefined, error: null }
}

export async function returnSingleItem(
  payload: ReturnSingleItemPayload,
): Promise<ActionResult<void>> {
  const parsed = returnSingleItemSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc("return_single_item", {
    p_session_id: payload.sessionId,
    p_user_id: payload.userId,
    p_item_id: payload.itemId,
  })

  if (error) return { data: null, error: error.message }
  return { data: undefined, error: null }
}
