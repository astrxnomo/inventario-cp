import { createClient } from "@/lib/supabase/server"
import type { MaintenanceItem } from "@/lib/types/maintenance"
import "server-only"

export async function getMaintenanceItems(): Promise<MaintenanceItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("items_maintenance")
    .select(
      `
      id,
      item_id,
      interval_days,
      created_at,
      inventory_items(id, name, cabinets(name))
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching maintenance items:", error)
    return []
  }

  const rows = data ?? []
  const maintenanceIds = rows.map((row: any) => row.id)

  const lastMaintenanceMap = new Map<string, string>()
  if (maintenanceIds.length > 0) {
    const { data: historyRows, error: historyError } = await supabase
      .from("maintenance_history")
      .select("maintenance_id,date,created_at")
      .in("maintenance_id", maintenanceIds)
      .order("date", { ascending: false })

    if (historyError) {
      console.error("Error fetching maintenance history summary:", historyError)
    } else {
      for (const historyRow of historyRows ?? []) {
        if (!lastMaintenanceMap.has(historyRow.maintenance_id)) {
          lastMaintenanceMap.set(
            historyRow.maintenance_id,
            historyRow.date ?? historyRow.created_at,
          )
        }
      }
    }
  }

  return rows.map((row: any) => {
    const item = Array.isArray(row.inventory_items)
      ? row.inventory_items[0]
      : row.inventory_items
    const cabinet = Array.isArray(item?.cabinets)
      ? item?.cabinets[0]
      : item?.cabinets
    const lastMaintenanceAt = lastMaintenanceMap.get(row.id) ?? null
    const baseDate = new Date(lastMaintenanceAt ?? row.created_at)
    const nextMaintenanceDate = new Date(baseDate)
    nextMaintenanceDate.setDate(
      nextMaintenanceDate.getDate() + row.interval_days,
    )

    const now = new Date()
    const dayMs = 1000 * 60 * 60 * 24
    const daysUntilNextMaintenance = Math.ceil(
      (nextMaintenanceDate.getTime() - now.getTime()) / dayMs,
    )

    const maintenanceStatus: MaintenanceItem["maintenance_status"] =
      daysUntilNextMaintenance < 0
        ? "overdue"
        : daysUntilNextMaintenance <= 7
          ? "due_soon"
          : "healthy"

    return {
      id: row.id,
      item_id: row.item_id,
      interval_days: row.interval_days,
      created_at: row.created_at,
      item_name: item?.name ?? "Item sin nombre",
      cabinet_name: cabinet?.name ?? "Sin gabinete",
      last_maintenance_at: lastMaintenanceAt,
      next_maintenance_at: nextMaintenanceDate.toISOString(),
      days_until_next_maintenance: daysUntilNextMaintenance,
      maintenance_status: maintenanceStatus,
    }
  })
}
