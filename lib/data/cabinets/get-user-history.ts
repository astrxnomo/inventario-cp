import type { HistorySession } from "@/lib/types/cabinets"
import type { Database } from "@/lib/supabase/types"
import type { SupabaseClient } from "@supabase/supabase-js"

export type { HistorySession }

export async function getUserSessionHistory(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<HistorySession[]> {
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
      (session.cabinets as { name: string } | null)?.name ??
      "Gabinete desconocido",
    opened_at: session.opened_at,
    closed_at: session.closed_at,
    notes: session.notes,
    items: (
      (session.session_items as Array<{
        quantity: number
        action: "withdrawn" | "returned"
        inventory_items: { name: string } | null
      }>) ?? []
    ).map((si) => ({
      name: si.inventory_items?.name ?? "Artículo desconocido",
      quantity: si.quantity,
      action: si.action,
    })),
  }))
}
