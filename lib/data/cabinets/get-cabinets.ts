import { createClient } from "@/lib/supabase/server"
import type { Cabinet } from "@/lib/types/cabinets"

export async function getCabinetsWithCounts(
  currentUserId?: string,
): Promise<Cabinet[]> {
  const supabase = await createClient()
  const userSessionsQuery = currentUserId
    ? supabase
        .from("cabinet_sessions")
        .select("cabinet_id")
        .eq("user_id", currentUserId)
        .is("closed_at", null)
    : Promise.resolve({ data: [], error: null })

  const [cabinetsRes, itemsRes, activeSessionsRes, myActiveSessionsRes] =
    await Promise.all([
      supabase.from("cabinets").select("*").order("name"),
      supabase.from("inventory_items").select("cabinet_id, name").order("name"),
      supabase
        .from("cabinet_sessions")
        .select("cabinet_id")
        .is("closed_at", null),
      userSessionsQuery,
    ])

  const itemCountMap: Record<string, number> = {}
  const itemNamesMap: Record<string, string[]> = {}
  const sessionCountMap: Record<string, number> = {}
  const mySessionCountMap: Record<string, number> = {}

  for (const row of itemsRes.data ?? []) {
    itemCountMap[row.cabinet_id] = (itemCountMap[row.cabinet_id] ?? 0) + 1
    itemNamesMap[row.cabinet_id] = [
      ...(itemNamesMap[row.cabinet_id] ?? []),
      row.name,
    ]
  }
  for (const row of activeSessionsRes.data ?? []) {
    sessionCountMap[row.cabinet_id] = (sessionCountMap[row.cabinet_id] ?? 0) + 1
  }
  for (const row of myActiveSessionsRes.data ?? []) {
    mySessionCountMap[row.cabinet_id] =
      (mySessionCountMap[row.cabinet_id] ?? 0) + 1
  }

  return (cabinetsRes.data ?? []).map((c) => ({
    ...c,
    _count: {
      inventory_items: itemCountMap[c.id] ?? 0,
      active_sessions: sessionCountMap[c.id] ?? 0,
      my_active_sessions: mySessionCountMap[c.id] ?? 0,
    },
    item_names: itemNamesMap[c.id] ?? [],
  }))
}
