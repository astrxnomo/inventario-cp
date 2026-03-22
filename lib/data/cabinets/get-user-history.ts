import { createClient } from "@/lib/supabase/server"

import type { HistorySession } from "@/lib/types/cabinets"

export type { HistorySession }

export async function getUserSessionHistory(
  userId: string,
): Promise<HistorySession[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("cabinet_sessions")
    .select(
      `id, opened_at, closed_at, notes,
       cabinets(name),
       session_items(quantity, action, inventory_items(name))`,
    )
    .eq("user_id", userId)
    .order("opened_at", { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((session) => ({
    id: session.id,
    cabinet_name:
      (session.cabinets as unknown as { name: string } | null)?.name ??
      "Gabinete desconocido",
    opened_at: session.opened_at,
    closed_at: session.closed_at,
    notes: session.notes,
    items: (
      (session.session_items as unknown as Array<{
        quantity: number
        action: "withdrawn" | "returned"
        inventory_items: { name: string } | null
      }>) ?? []
    ).map((si) => ({
      name:
        (si.inventory_items as unknown as { name: string } | null)?.name ??
        "Artículo desconocido",
      quantity: si.quantity,
      action: si.action,
    })),
  }))
}
