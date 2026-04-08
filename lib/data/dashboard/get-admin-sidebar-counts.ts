import "server-only"

import { createClient } from "@/lib/supabase/server"

type SidebarCounts = {
  activeSessions: number
  activeReservations: number
  maintenanceAttention: number
}

export async function getAdminSidebarCounts(): Promise<SidebarCounts> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("get_admin_dashboard_analytics", {
    p_days: 30,
  })

  if (error || !data) {
    if (error) {
      console.error("Error fetching sidebar counts from analytics RPC:", error)
    }

    return {
      activeSessions: 0,
      activeReservations: 0,
      maintenanceAttention: 0,
    }
  }

  const analytics = data as {
    summary?: {
      activeSessions?: number
      activeReservations?: number
    }
    tabs?: {
      maintenance?: {
        kpis?: {
          overdue?: number
          dueSoon?: number
        }
      }
    }
  }

  const { data: maintenanceItems, error: maintenanceItemsError } =
    await supabase.from("items_maintenance").select(
      `
      id,
      interval_days,
      maintenance_history(date,created_at)
    `,
    )

  if (maintenanceItemsError) {
    console.error("Error fetching maintenance items:", maintenanceItemsError)
  }

  let overdue = 0
  let dueSoon = 0
  let withoutHistory = 0

  const now = new Date()

  for (const row of maintenanceItems ?? []) {
    const history = Array.isArray((row as any).maintenance_history)
      ? ((row as any).maintenance_history as Array<{
          date?: string | null
          created_at?: string | null
        }>)
      : []

    const latest =
      history
        .map((h) => h.date ?? h.created_at)
        .filter((v): v is string => Boolean(v))
        .sort((a, b) => +new Date(b) - +new Date(a))[0] ?? null

    if (!latest) {
      withoutHistory += 1
      continue
    }

    const intervalDays = (row as any).interval_days as number | null
    if (!intervalDays || intervalDays <= 0) continue

    const baseDate = new Date(latest)
    const nextDate = new Date(baseDate)
    nextDate.setDate(nextDate.getDate() + intervalDays)

    const daysLeft = Math.ceil(
      (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    )

    if (daysLeft < 0) overdue += 1
    else if (daysLeft <= 7) dueSoon += 1
  }

  const maintenanceAttention = overdue + dueSoon + withoutHistory

  return {
    activeSessions: analytics.summary?.activeSessions ?? 0,
    activeReservations: analytics.summary?.activeReservations ?? 0,
    maintenanceAttention,
  }
}
