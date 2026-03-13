import type { CabinetAdmin, CabinetItemAdmin } from "@/lib/types/cabinets"
import type { Database } from "@/lib/supabase/types"
import type { SupabaseClient } from "@supabase/supabase-js"

export type { CabinetAdmin, CabinetItemAdmin }

export async function getCabinetsAdmin(
  supabase: SupabaseClient<Database>,
): Promise<CabinetAdmin[]> {
  const [cabinetsRes, itemCountsRes] = await Promise.all([
    supabase.from("cabinets").select("*").order("name"),
    supabase.from("inventory_items").select("cabinet_id"),
  ])

  const itemCountMap: Record<string, number> = {}
  for (const row of itemCountsRes.data ?? []) {
    itemCountMap[row.cabinet_id] = (itemCountMap[row.cabinet_id] ?? 0) + 1
  }

  return (cabinetsRes.data ?? []).map((c) => ({
    ...c,
    item_count: itemCountMap[c.id] ?? 0,
  }))
}

export async function getCabinetItemsAdmin(
  supabase: SupabaseClient<Database>,
  cabinetId: string,
): Promise<CabinetItemAdmin[]> {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("id, name, quantity, category_id, inventory_categories(name)")
    .eq("cabinet_id", cabinetId)
    .order("name")
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    category_id: row.category_id,
    category_name:
      (row.inventory_categories as { name: string } | null)?.name ??
      "Sin categoría",
  }))
}
