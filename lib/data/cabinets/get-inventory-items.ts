import { createClient } from "@/lib/supabase/client"
import type { ActionResult, InventoryItem } from "@/lib/types/cabinets"

export async function fetchInventoryItems(
  cabinetId: string,
): Promise<ActionResult<InventoryItem[]>> {
  const supabase = createClient()

  const [{ data: rawItems, error }, { data: sessions }] = await Promise.all([
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
  ])

  if (error) return { data: null, error: error.message }

  const inUseMap: Record<string, number> = {}
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
    inventory_categories: { name: string } | null
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
      category: item.inventory_categories?.name ?? "Sin categoría",
      in_use: inUseMap[item.id] ?? 0,
    })),
    error: null,
  }
}
