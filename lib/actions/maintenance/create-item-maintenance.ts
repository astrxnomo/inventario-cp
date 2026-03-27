"use server"

import {
  assertAdmin,
  collectFieldErrors,
  type AdminFormState,
} from "@/lib/actions/shared"
import { itemMaintenanceSchema } from "@/lib/schemas/maintenance"
import { revalidatePath } from "next/cache"

export async function createItemMaintenance(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const parsed = itemMaintenanceSchema.safeParse({
    item_id: formData.get("item_id"),
    interval_days: formData.get("interval_days"),
  })

  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) }
  }

  try {
    const supabase = await assertAdmin()

    const { data: existing, error: checkError } = await supabase
      .from("items_maintenance")
      .select("id")
      .eq("item_id", parsed.data.item_id)
      .maybeSingle()

    if (checkError) return { error: checkError.message }
    if (existing) {
      return { error: "Este item ya esta registrado para mantenimiento" }
    }

    const { error } = await supabase.from("items_maintenance").insert({
      item_id: parsed.data.item_id,
      interval_days: parsed.data.interval_days,
    })

    if (error) return { error: error.message }

    revalidatePath("/admin/maintenance")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
