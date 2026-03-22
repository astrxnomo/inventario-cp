import { createClient } from "@/lib/supabase/server"

export type AdminSession = {
  id: string
  user_id: string
  cabinet_id: string
  opened_at: string
  closed_at: string | null
  notes: string | null
  user_name?: string
  cabinet_name?: string
  items_count?: number
}

export async function getAllSessions(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<AdminSession[]> {
  // Fetch sessions with user, cabinet, and items count
  const { data, error } = await supabase
    .from("cabinet_sessions")
    .select(
      `
      id,
      user_id,
      cabinet_id,
      opened_at,
      closed_at,
      notes,
      profiles!inner(full_name),
      cabinets!inner(name)
    `,
    )
    .order("opened_at", { ascending: false })
    .limit(200)

  if (error) {
    console.error("Error fetching sessions:", error)
    return []
  }

  // Fetch session items count separately
  const sessionIds = (data ?? []).map((s) => s.id)
  const { data: itemsData } = await supabase
    .from("session_items")
    .select("session_id")
    .in("session_id", sessionIds)

  const itemsCountMap: Record<string, number> = {}
  for (const item of itemsData ?? []) {
    itemsCountMap[item.session_id] = (itemsCountMap[item.session_id] ?? 0) + 1
  }

  return (data ?? []).map((session) => ({
    id: session.id,
    user_id: session.user_id,
    cabinet_id: session.cabinet_id,
    opened_at: session.opened_at,
    closed_at: session.closed_at,
    notes: session.notes,
    user_name: (session.profiles as any)?.full_name ?? "Sin nombre",
    cabinet_name: (session.cabinets as any)?.name ?? "Sin gabinete",
    items_count: itemsCountMap[session.id] ?? 0,
  }))
}
