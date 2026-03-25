import { createClient } from "@/lib/supabase/server"

export type SessionItem = {
  id: string
  name: string
  category?: string
  added_at: string
  action: "withdrawn" | "returned"
  quantity: number
}

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
  items?: SessionItem[]
}

export async function getAllSessions(): Promise<AdminSession[]> {
  const supabase = await createClient()
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
      cabinets!inner(name)
    `,
    )
    .order("opened_at", { ascending: false })
    .limit(200)

  if (error) {
    console.error("Error fetching sessions:", error)
    return []
  }

  // cabinet_sessions.user_id referencia auth.users, no profiles directamente.
  // Resolver nombres desde profiles por id = user_id.
  const userIds = Array.from(
    new Set((data ?? []).map((s) => s.user_id)),
  ).filter(Boolean)

  const { data: profilesData } = userIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] as Array<{ id: string; full_name: string | null }> }

  const profilesMap = new Map(
    (profilesData ?? []).map((p) => [p.id, p.full_name]),
  )

  // Fetch session items with details
  const sessionIds = (data ?? []).map((s) => s.id)
  const { data: itemsData } = await supabase
    .from("session_items")
    .select(
      `
      id,
      session_id,
      action,
      quantity,
      inventory_items!inner(id, name),
      created_at
    `,
    )
    .in("session_id", sessionIds)
    .order("created_at", { ascending: true })

  const itemsMap: Record<string, SessionItem[]> = {}
  const itemsCountMap: Record<string, number> = {}

  for (const item of itemsData ?? []) {
    const sessionId = item.session_id
    if (!itemsMap[sessionId]) {
      itemsMap[sessionId] = []
    }
    itemsMap[sessionId].push({
      id: item.id,
      name: (item.inventory_items as any)?.name ?? "Sin nombre",
      added_at: item.created_at,
      action: item.action as "withdrawn" | "returned",
      quantity: item.quantity,
    })
    itemsCountMap[sessionId] = (itemsCountMap[sessionId] ?? 0) + 1
  }

  return (data ?? []).map((session) => ({
    id: session.id,
    user_id: session.user_id,
    cabinet_id: session.cabinet_id,
    opened_at: session.opened_at,
    closed_at: session.closed_at,
    notes: session.notes,
    user_name: profilesMap.get(session.user_id) ?? "Sin nombre",
    cabinet_name: (session.cabinets as any)?.name ?? "Sin gabinete",
    items_count: itemsCountMap[session.id] ?? 0,
    items: itemsMap[session.id] ?? [],
  }))
}
