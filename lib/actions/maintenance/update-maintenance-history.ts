"use server"

import { assertAdmin } from "@/lib/actions/shared"
import { maintenanceHistoryUpdateSchema } from "@/lib/schemas/maintenance"
import { revalidatePath } from "next/cache"

export async function updateMaintenanceHistory(
  id: string,
  payload: { maintenance_id?: string; date?: string },
): Promise<{ error?: string }> {
  const parsed = maintenanceHistoryUpdateSchema.safeParse(payload)

  if (!parsed.success) {
    return { error: "Datos de historial invalidos" }
  }

  try {
    const supabase = await assertAdmin()

    const updateObj: Record<string, unknown> = {}

    if (parsed.data.maintenance_id) {
      updateObj.maintenance_id = parsed.data.maintenance_id
    }

    if (parsed.data.date) {
      // ensure we store an ISO timestamp
      updateObj.date = new Date(parsed.data.date).toISOString()
    }

    if (Object.keys(updateObj).length === 0) {
      return { error: "Nada que actualizar" }
    }

    const { error } = await supabase
      .from("maintenance_history")
      .update(updateObj)
      .eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/admin/maintenance")
    return {}
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
