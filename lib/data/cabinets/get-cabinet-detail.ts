import { createClient } from "@/lib/supabase/client"
import type {
    ActionResult,
    InventoryItem,
    WithdrawnItem,
} from "@/lib/types/cabinets"
import { fetchInventoryItems } from "./get-inventory-items"

export interface CabinetDetailState {
  sessionId: string | null
  items: InventoryItem[]
  withdrawnItems: WithdrawnItem[]
}

export async function fetchCabinetDetailState(
  cabinetId: string,
  userId: string,
): Promise<ActionResult<CabinetDetailState>> {
  const supabase = createClient()

  const { data: session } = await supabase
    .from("cabinet_sessions")
    .select("id")
    .eq("cabinet_id", cabinetId)
    .eq("user_id", userId)
    .is("closed_at", null)
    .maybeSingle()

  if (session) {
    const { data: sessionItems, error } = await supabase
      .from("session_items")
      .select("id, item_id, quantity, inventory_items(name, inventory_categories(name))")
      .eq("session_id", session.id)
      .eq("action", "withdrawn")

    if (error) return { data: null, error: error.message }

    type JoinedSessionItem = {
      id: string
      item_id: string
      quantity: number
      inventory_items: {
        name: string
        inventory_categories: { name: string } | null
      } | null
    }

    const withdrawnItems: WithdrawnItem[] = (
      (sessionItems ?? []) as unknown as JoinedSessionItem[]
    ).map((si) => ({
      session_item_id: si.id,
      item_id: si.item_id,
      name: si.inventory_items?.name ?? "",
      category: si.inventory_items?.inventory_categories?.name ?? "Sin categoría",
      quantity: si.quantity,
    }))

    return {
      data: { sessionId: session.id, items: [], withdrawnItems },
      error: null,
    }
  }

  const itemsResult = await fetchInventoryItems(cabinetId)
  if (itemsResult.error) return { data: null, error: itemsResult.error }

  return {
    data: {
      sessionId: null,
      items: itemsResult.data ?? [],
      withdrawnItems: [],
    },
    error: null,
  }
}
