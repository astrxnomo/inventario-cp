import type { Category } from "@/lib/types/categories"
import type { Database } from "@/lib/supabase/types"
import type { SupabaseClient } from "@supabase/supabase-js"

export type { Category }

export async function getCategories(
  supabase: SupabaseClient<Database>,
): Promise<Category[]> {
  const { data, error } = await supabase
    .from("inventory_categories")
    .select("id, name")
    .order("name")
  if (error) throw new Error(error.message)
  return data ?? []
}
