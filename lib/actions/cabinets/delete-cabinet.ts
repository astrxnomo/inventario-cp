"use server"

import { assertAdmin } from "@/lib/actions/shared"
import { revalidatePath } from "next/cache"

export async function deleteCabinet(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await assertAdmin()
    const { count, error: countError } = await supabase
      .from("inventory_items")
      .select("*", { count: "exact", head: true })
      .eq("cabinet_id", id)

    if (countError) return { error: countError.message }
    if (count && count > 0) {
      return {
        error: "No se puede eliminar el gabinete porque contiene items.",
      }
    }

    const { error } = await supabase.from("cabinets").delete().eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/admin/cabinets")
    return {}
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
