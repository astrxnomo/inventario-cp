"use server"

import { assertAdmin } from "@/lib/actions/shared"
import { itemMaintenanceSchema } from "@/lib/schemas/maintenance"
import { revalidatePath } from "next/cache"

export async function updateItemMaintenance(
  id: string,
  payload: { item_id: string; interval_days: number },
): Promise<{ error?: string }> {
  const parsed = itemMaintenanceSchema.safeParse(payload)

  if (!parsed.success) {
    return { error: "Datos de mantenimiento invalidos" }
  }

  try {
    const supabase = await assertAdmin()

    const { data: existing, error: checkError } = await supabase
      .from("items_maintenance")
      .select("id")
      .eq("item_id", parsed.data.item_id)
      .neq("id", id)
      .maybeSingle()

    if (checkError) return { error: checkError.message }
    if (existing) {
      return { error: "Ese item ya tiene mantenimiento configurado" }
    }

    const { error } = await supabase
      .from("items_maintenance")
      .update({
        item_id: parsed.data.item_id,
        interval_days: parsed.data.interval_days,
      })
      .eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/admin/maintenance")
    return {}
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
