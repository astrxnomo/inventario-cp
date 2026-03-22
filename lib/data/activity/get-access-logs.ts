import { createClient } from "@/lib/supabase/server"

export type AccessLog = {
  id: string
  user_id: string
  cabinet_id: string
  action: "open" | "close" | "lock" | "unlock" | "error"
  timestamp: string
  metadata: Record<string, any> | null
  user_name?: string
  user_email?: string
  cabinet_name?: string
}

export async function getAccessLogs(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<AccessLog[]> {
  const { data, error } = await supabase
    .from("access_logs")
    .select(
      `
      id,
      user_id,
      cabinet_id,
      action,
      timestamp,
      metadata,
      profiles!inner(full_name, email),
      cabinets!inner(name)
    `,
    )
    .order("timestamp", { ascending: false })
    .limit(500) // Limitar a últimos 500 registros

  if (error) {
    console.error("Error fetching access logs:", error)
    return []
  }

  return (data ?? []).map((log) => ({
    id: log.id,
    user_id: log.user_id,
    cabinet_id: log.cabinet_id,
    action: log.action as AccessLog["action"],
    timestamp: log.timestamp,
    metadata: log.metadata,
    user_name: (log.profiles as any)?.full_name ?? "Sin nombre",
    user_email: (log.profiles as any)?.email ?? "",
    cabinet_name: (log.cabinets as any)?.name ?? "Sin gabinete",
  }))
}
