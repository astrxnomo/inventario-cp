"use server"

import {
  returnSchema,
  returnSingleItemSchema,
  returnSingleItemWithQuantitySchema,
} from "@/lib/schemas/cabinets"
import { createClient } from "@/lib/supabase/server"
import type {
  ActionResult,
  ReturnPayload,
  ReturnSingleItemPayload,
  ReturnSingleItemWithQuantityPayload,
} from "@/lib/types/cabinets"
import { openCabinetWithMqtt } from "./open-with-mqtt"

interface OpenCabinetForReturnPayload {
  userId: string
  cabinetLocation?: string | null
}

export async function openCabinetForReturn(
  payload: OpenCabinetForReturnPayload,
): Promise<ActionResult<void>> {
  if (!payload.cabinetLocation?.trim()) {
    return {
      data: null,
      error: "La ubicación del gabinete es requerida para abrirlo",
    }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: "No autenticado" }
    }

    if (user.id !== payload.userId) {
      return {
        data: null,
        error: "No autorizado para abrir el gabinete",
      }
    }

    await openCabinetWithMqtt("centro/a1", {
      id: payload.cabinetLocation,
    })

    return { data: undefined, error: null }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        data: null,
        error: error.message || "Error al abrir el gabinete",
      }
    }

    return {
      data: null,
      error: "Error al abrir el gabinete",
    }
  }
}

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
  return returnSingleItemWithQuantity({ ...payload, quantity: 1 })
}

export async function returnSingleItemWithQuantity(
  payload: ReturnSingleItemWithQuantityPayload,
): Promise<ActionResult<void>> {
  const parsed = returnSingleItemWithQuantitySchema.safeParse(payload)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    }
  }

  const input = parsed.data
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: "No autenticado" }
  }

  if (user.id !== input.userId) {
    return {
      data: null,
      error: "No autorizado para devolver artículos en nombre de otro usuario",
    }
  }

  const { data: session, error: sessionError } = await supabase
    .from("cabinet_sessions")
    .select("id, closed_at")
    .eq("id", input.sessionId)
    .eq("user_id", input.userId)
    .maybeSingle()

  if (sessionError) {
    return { data: null, error: sessionError.message }
  }

  if (!session) {
    return { data: null, error: "Sesión no encontrada" }
  }

  if (session.closed_at) {
    return { data: null, error: "La sesión ya está cerrada" }
  }

  const { data: sessionItems, error: itemsError } = await supabase
    .from("session_items")
    .select("item_id, action, quantity")
    .eq("session_id", input.sessionId)

  if (itemsError) {
    return { data: null, error: itemsError.message }
  }

  const netByItem = new Map<string, number>()

  for (const entry of sessionItems ?? []) {
    const sign = entry.action === "withdrawn" ? 1 : -1
    netByItem.set(
      entry.item_id,
      (netByItem.get(entry.item_id) ?? 0) + sign * entry.quantity,
    )
  }

  const pendingForItem = netByItem.get(input.itemId) ?? 0

  if (pendingForItem <= 0) {
    return { data: null, error: "El artículo ya fue devuelto" }
  }

  if (input.quantity > pendingForItem) {
    return {
      data: null,
      error: `Solo puedes devolver hasta ${pendingForItem} unidad${pendingForItem !== 1 ? "es" : ""}`,
    }
  }

  // Keep existing RPC behavior for full-item returns.
  if (input.quantity === pendingForItem) {
    const { error } = await supabase.rpc("return_single_item", {
      p_session_id: input.sessionId,
      p_user_id: input.userId,
      p_item_id: input.itemId,
    })

    if (error) return { data: null, error: error.message }
    return { data: undefined, error: null }
  }

  const { data: inventoryItem, error: inventoryError } = await supabase
    .from("inventory_items")
    .select("id, quantity")
    .eq("id", input.itemId)
    .maybeSingle()

  if (inventoryError) {
    return { data: null, error: inventoryError.message }
  }

  if (!inventoryItem) {
    return { data: null, error: "Artículo no encontrado en inventario" }
  }

  const { error: updateInventoryError } = await supabase
    .from("inventory_items")
    .update({ quantity: inventoryItem.quantity + input.quantity })
    .eq("id", input.itemId)

  if (updateInventoryError) {
    return { data: null, error: updateInventoryError.message }
  }

  const { error: insertReturnError } = await supabase.from("session_items").insert({
    session_id: input.sessionId,
    item_id: input.itemId,
    action: "returned",
    quantity: input.quantity,
  })

  if (insertReturnError) {
    return { data: null, error: insertReturnError.message }
  }

  const remainingAfterReturn = Array.from(netByItem.entries()).reduce(
    (total, [itemId, pending]) =>
      total + (itemId === input.itemId ? pending - input.quantity : pending),
    0,
  )

  if (remainingAfterReturn <= 0) {
    const { error: closeSessionError } = await supabase
      .from("cabinet_sessions")
      .update({ closed_at: new Date().toISOString() })
      .eq("id", input.sessionId)

    if (closeSessionError) {
      return { data: null, error: closeSessionError.message }
    }
  }

  return { data: undefined, error: null }
}
