import { createClient } from "@/lib/supabase/server"

export type InventoryItem = {
  id: string
  cabinet_id: string
  name: string
  quantity: number
  category_id: string | null
  created_at: string
  updated_at: string
  cabinet_name?: string
  category_name?: string
}

export async function getInventoryItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from("inventory_items")
    .select(
      `
      id,
      cabinet_id,
      name,
      quantity,
      category_id,
      created_at,
      updated_at,
      cabinets!inner(name),
      inventory_categories(name)
    `,
    )
    .order("name")

  if (error) {
    console.error("Error fetching inventory items:", error)
    return []
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    cabinet_id: item.cabinet_id,
    name: item.name,
    quantity: item.quantity,
    category_id: item.category_id,
    created_at: item.created_at,
    updated_at: item.updated_at,
    cabinet_name: (item.cabinets as any)?.name ?? "Sin gabinete",
    category_name: (item.inventory_categories as any)?.name ?? "Sin categoría",
  }))
}
