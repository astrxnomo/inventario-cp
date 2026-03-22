import { createClient } from "@/lib/supabase/server"

import type { Category } from "@/lib/types/categories"

export type { Category }

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("inventory_categories")
    .select("id, name")
    .order("name")
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAdminCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const [categoriesRes, itemsRes] = await Promise.all([
    supabase.from("inventory_categories").select("id, name").order("name"),
    supabase.from("inventory_items").select("category_id"),
  ])

  if (categoriesRes.error) throw new Error(categoriesRes.error.message)

  const counts: Record<string, number> = {}
  itemsRes.data?.forEach((item) => {
    if (item.category_id) {
      counts[item.category_id] = (counts[item.category_id] || 0) + 1
    }
  })

  return (categoriesRes.data ?? []).map((cat) => ({
    ...cat,
    _count: {
      inventory_items: counts[cat.id] || 0,
    },
  }))
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("inventory_categories")
    .select("id, name")
    .eq("id", id)
    .single()

  if (error) return null
  return data
}
