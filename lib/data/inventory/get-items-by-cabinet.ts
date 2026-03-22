"use server"

import { createClient } from "@/lib/supabase/server"
import type { ActionResult, CabinetInventoryItem } from "@/lib/types/cabinets"

export async function getItemsByCabinet(
  cabinetId: string,
  userId: string,
): Promise<ActionResult<CabinetInventoryItem[]>> {
  const supabase = await createClient()

  const now = new Date().toISOString()

  const [
    { data: rawItems, error },
    { data: sessions },
    { data: reservations },
  ] = await Promise.all([
    supabase
      .from("inventory_items")
      .select(
        "id, cabinet_id, category_id, name, quantity, created_at, updated_at, inventory_categories(name)",
      )
      .eq("cabinet_id", cabinetId)
      .order("name"),
    supabase
      .from("cabinet_sessions")
      .select("id")
      .eq("cabinet_id", cabinetId)
      .is("closed_at", null),
    supabase
      .from("item_reservations")
      .select("item_id, quantity, user_id")
      .eq("cabinet_id", cabinetId)
      .eq("status", "active")
      .lte("starts_at", now)
      .gte("ends_at", now),
  ])

  if (error) return { data: null, error: error.message }

  const inUseMap: Record<string, number> = {}
  const reservedByMeMap: Record<string, number> = {}
  const reservedByOthersMap: Record<string, number> = {}

  for (const res of reservations ?? []) {
    if (res.user_id === userId) {
      reservedByMeMap[res.item_id] =
        (reservedByMeMap[res.item_id] ?? 0) + res.quantity
    } else {
      reservedByOthersMap[res.item_id] =
        (reservedByOthersMap[res.item_id] ?? 0) + res.quantity
    }
  }

  const sessionIds = (sessions ?? []).map((s) => s.id)

  if (sessionIds.length > 0) {
    const { data: sessionItems } = await supabase
      .from("session_items")
      .select("item_id, quantity")
      .in("session_id", sessionIds)
      .eq("action", "withdrawn")

    for (const row of sessionItems ?? []) {
      inUseMap[row.item_id] = (inUseMap[row.item_id] ?? 0) + row.quantity
    }
  }

  type JoinedInventoryItem = {
    id: string
    cabinet_id: string
    category_id: string
    name: string
    quantity: number
    created_at: string
    updated_at: string
    inventory_categories: { name: string } | { name: string }[] | null
  }

  return {
    data: ((rawItems ?? []) as JoinedInventoryItem[]).map((item) => ({
      id: item.id,
      cabinet_id: item.cabinet_id,
      category_id: item.category_id,
      name: item.name,
      quantity: item.quantity,
      created_at: item.created_at,
      updated_at: item.updated_at,
      category:
        (Array.isArray(item.inventory_categories)
          ? item.inventory_categories[0]?.name
          : item.inventory_categories?.name) ?? "Sin categoría",
      in_use: inUseMap[item.id] ?? 0,
      reserved_by_me: reservedByMeMap[item.id] ?? 0,
      reserved_by_others: reservedByOthersMap[item.id] ?? 0,
    })),
    error: null,
  }
}
