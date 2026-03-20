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
      .select(
        "id, item_id, action, quantity, inventory_items(name, inventory_categories(name))",
      )
      .eq("session_id", session.id)

    if (error) return { data: null, error: error.message }

    type JoinedSessionItem = {
      id: string
      item_id: string
      action: string
      quantity: number
      inventory_items: {
        name: string
        inventory_categories: { name: string } | null
      } | null
    }

    // Compute net quantity per item (withdrawn minus returned)
    const netQtyMap = new Map<string, number>()
    const metaMap = new Map<string, { name: string; category: string }>()

    for (const si of (sessionItems ?? []) as unknown as JoinedSessionItem[]) {
      const sign = si.action === "withdrawn" ? 1 : -1
      netQtyMap.set(
        si.item_id,
        (netQtyMap.get(si.item_id) ?? 0) + sign * si.quantity,
      )
      if (!metaMap.has(si.item_id)) {
        metaMap.set(si.item_id, {
          name: si.inventory_items?.name ?? "",
          category:
            si.inventory_items?.inventory_categories?.name ?? "Sin categoría",
        })
      }
    }

    const withdrawnItems: WithdrawnItem[] = Array.from(netQtyMap.entries())
      .filter(([, net]) => net > 0)
      .map(([item_id, quantity]) => {
        const meta = metaMap.get(item_id)!
        return {
          session_item_id: "",
          item_id,
          name: meta.name,
          category: meta.category,
          quantity,
        }
      })

    return {
      data: { sessionId: session.id, items: [], withdrawnItems },
      error: null,
    }
  }

  const itemsResult = await fetchInventoryItems(cabinetId, userId)
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
