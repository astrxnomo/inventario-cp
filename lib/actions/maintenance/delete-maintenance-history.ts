"use server"

import { assertAdmin } from "@/lib/actions/shared"
import { revalidatePath } from "next/cache"

export async function deleteMaintenanceHistory(
  id: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await assertAdmin()

    const { error } = await supabase
      .from("maintenance_history")
      .delete()
      .eq("id", id)
    if (error) return { error: error.message }

    revalidatePath("/admin/maintenance")
    return {}
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
