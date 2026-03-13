import type { Database } from "@/lib/supabase/types"
import type { AccessLogEntry, SessionWithItems } from "@/lib/types/logs"
import type { SupabaseClient } from "@supabase/supabase-js"

export type { AccessLogEntry, SessionWithItems }

async function buildProfileMap(
  supabase: SupabaseClient<Database>,
  userIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (userIds.length === 0) return map
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", userIds)
  for (const p of data ?? []) {
    map.set(p.id, p.full_name ?? p.id.slice(0, 8))
  }
  return map
}

export async function getAccessLogs(
  supabase: SupabaseClient<Database>,
): Promise<AccessLogEntry[]> {
  const { data, error } = await supabase
    .from("access_logs")
    .select("id, created_at, action, cabinet_id, user_id, cabinets ( name )")
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) throw new Error(error.message)
  const rows = (data ?? []) as any[]

  const userIds = [
    ...new Set(rows.filter((r) => r.user_id).map((r) => r.user_id as string)),
  ]
  const profiles = await buildProfileMap(supabase, userIds)

  return rows.map((row) => ({
    id: row.id,
    created_at: row.created_at,
    action: row.action,
    cabinet_id: row.cabinet_id,
    cabinet_name: row.cabinets?.name ?? null,
    user_name: row.user_id
      ? (profiles.get(row.user_id) ?? row.user_id.slice(0, 8))
      : "Sistema",
  }))
}

export async function getSessionsWithItems(
  supabase: SupabaseClient<Database>,
): Promise<SessionWithItems[]> {
  const { data, error } = await supabase
    .from("cabinet_sessions")
    .select(
      "id, opened_at, closed_at, cabinet_id, user_id, cabinets ( name ), session_items ( id, created_at, action, quantity, inventory_items ( name ) )",
    )
    .order("opened_at", { ascending: false })
    .limit(100)

  if (error) throw new Error(error.message)
  const rows = (data ?? []) as any[]

  const userIds = [
    ...new Set(rows.map((r) => r.user_id as string).filter(Boolean)),
  ]
  const profiles = await buildProfileMap(supabase, userIds)

  return rows.map((row) => ({
    id: row.id,
    opened_at: row.opened_at,
    closed_at: row.closed_at,
    cabinet_id: row.cabinet_id,
    cabinet_name: row.cabinets?.name ?? null,
    user_name: profiles.get(row.user_id) ?? row.user_id?.slice(0, 8) ?? "—",
    items: (Array.isArray(row.session_items) ? row.session_items : [])
      .sort((a: any, b: any) => a.created_at.localeCompare(b.created_at))
      .map((si: any) => ({
        id: si.id,
        created_at: si.created_at,
        action: si.action,
        quantity: si.quantity,
        item_name: si.inventory_items?.name ?? null,
      })),
  }))
}
