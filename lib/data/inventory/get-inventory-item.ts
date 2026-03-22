import { createClient } from "@/lib/supabase/server"
import { InventoryItem } from "@/lib/types/inventory"
import "server-only"

export async function getInventoryItem(
  id: string,
): Promise<InventoryItem | null> {
  const supabase = await createClient()

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
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching inventory item:", error)
    return null
  }

  return {
    id: data.id,
    cabinet_id: data.cabinet_id,
    name: data.name,
    quantity: data.quantity,
    category_id: data.category_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    cabinet_name: (data.cabinets as any)?.name ?? "Sin gabinete",
    category_name: (data.inventory_categories as any)?.name ?? "Sin categoría",
  }
}
