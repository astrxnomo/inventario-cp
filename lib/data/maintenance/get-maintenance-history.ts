import { createClient } from "@/lib/supabase/server"
import type { MaintenanceHistoryEntry } from "@/lib/types/maintenance"
import "server-only"

export async function getMaintenanceHistory(): Promise<
  MaintenanceHistoryEntry[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("maintenance_history")
    .select(
      `
      id,
      maintenance_id,
      registered_by,
      created_at,
      date,
      items_maintenance!inner(
        id,
        interval_days,
        description,
        item_id,
        inventory_items(id, name, cabinets(name))
      )
    `,
    )
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching maintenance history:", error)
    return []
  }
  const rows = data ?? []

  // Resolve registered_by ids to profile names
  const registeredByIds = Array.from(
    new Set(rows.map((r: any) => r.registered_by).filter(Boolean)),
  )

  const profilesMap = new Map<
    string,
    { full_name?: string | null; email?: string | null }
  >()
  if (registeredByIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", registeredByIds)

    ;(profilesData ?? []).forEach((p: any) => profilesMap.set(p.id, p))
  }

  return rows.map((row: any) => {
    const maintenance = Array.isArray(row.items_maintenance)
      ? row.items_maintenance[0]
      : row.items_maintenance
    const item = Array.isArray(maintenance?.inventory_items)
      ? maintenance?.inventory_items[0]
      : maintenance?.inventory_items
    const cabinet = Array.isArray(item?.cabinets)
      ? item?.cabinets[0]
      : item?.cabinets

    return {
      id: row.id,
      maintenance_id: row.maintenance_id,
      created_at: row.created_at,
      date: row.date ?? row.created_at,
      item_id: maintenance?.item_id ?? "",
      item_name: item?.name ?? "Item sin nombre",
      description: maintenance?.description ?? null,
      cabinet_name: cabinet?.name ?? "Sin gabinete",
      interval_days: maintenance?.interval_days ?? 0,
      registered_by: row.registered_by ?? null,
      registered_by_name:
        (row.registered_by && profilesMap.get(row.registered_by)?.full_name) ||
        null,
    }
  })
}
