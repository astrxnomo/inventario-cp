import type { DashboardKpis } from "@/lib/types/users"
import type { Database } from "@/lib/supabase/types"
import type { SupabaseClient } from "@supabase/supabase-js"

export type { DashboardKpis }

export async function getDashboardKpis(
  supabase: SupabaseClient<Database>,
): Promise<DashboardKpis> {
  const [cabinetsRes, itemsRes, sessionsRes, usersRes] = await Promise.all([
    supabase.from("cabinets").select("id, status"),
    supabase
      .from("inventory_items")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("cabinet_sessions")
      .select("*", { count: "exact", head: true })
      .is("closed_at", null),
    supabase.rpc("get_admin_user_list"),
  ])

  const cabinets = cabinetsRes.data ?? []
  return {
    totalCabinets: cabinets.length,
    totalItems: itemsRes.count ?? 0,
    activeSessions: sessionsRes.count ?? 0,
    pendingUsers: ((usersRes.data ?? []) as Array<{ role: string }>).filter(
      (u) => u.role === "pending",
    ).length,
    lockedCabinets: cabinets.filter((c) => c.status === "locked").length,
  }
}
