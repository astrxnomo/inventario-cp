"use server"

import { assertAdmin } from "@/lib/actions/shared"
import { revalidatePath } from "next/cache"

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await assertAdmin()

    // Check for items first
    const { count, error: countError } = await supabase
      .from("inventory_items")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id)

    if (countError) return { error: countError.message }
    if (count && count > 0) {
      return {
        error:
          "No se puede eliminar la categoría porque tiene items asociados.",
      }
    }

    const { error } = await supabase
      .from("inventory_categories")
      .delete()
      .eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/admin/categories")
    return {}
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
