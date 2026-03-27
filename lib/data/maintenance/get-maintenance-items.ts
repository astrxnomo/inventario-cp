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

  return (data ?? []).map((row: any) => {
    const item = Array.isArray(row.inventory_items)
      ? row.inventory_items[0]
      : row.inventory_items
    const cabinet = Array.isArray(item?.cabinets)
      ? item?.cabinets[0]
      : item?.cabinets

    return {
      id: row.id,
      item_id: row.item_id,
      interval_days: row.interval_days,
      created_at: row.created_at,
      item_name: item?.name ?? "Item sin nombre",
      cabinet_name: cabinet?.name ?? "Sin gabinete",
    }
  })
}
