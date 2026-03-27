import { createClient } from "@/lib/supabase/server"
import { AccessLog } from "@/lib/types/logs"

export async function getAccessLogs(): Promise<AccessLog[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("access_logs")
    .select(
      `
      id,
      user_id,
      cabinet_id,
      action,
      created_at,
      metadata,
      cabinets!inner(name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(500) // Limitar a últimos 500 registros

  if (error) {
    console.error("Error fetching access logs:", error)
    return []
  }

  // access_logs no tiene FK directa a profiles; resolver usuarios por user_id
  const userIds = Array.from(
    new Set((data ?? []).map((log) => log.user_id)),
  ).filter(Boolean)

  const { data: profilesData } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds)
    : {
        data: [] as Array<{
          id: string
          full_name: string | null
          email: string
        }>,
      }

  const profilesMap = new Map((profilesData ?? []).map((p) => [p.id, p]))

  return (data ?? []).map((log) => ({
    id: log.id,
    user_id: log.user_id,
    cabinet_id: log.cabinet_id,
    action: log.action as AccessLog["action"],
    created_at: log.created_at,
    metadata: log.metadata,
    user_name: profilesMap.get(log.user_id)?.full_name ?? "Sin nombre",
    user_email: profilesMap.get(log.user_id)?.email ?? "",
    cabinet_name: (log.cabinets as any)?.name ?? "Sin gabinete",
  }))
}
