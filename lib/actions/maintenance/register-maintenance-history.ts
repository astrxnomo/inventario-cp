"use server"

import { assertAdmin } from "@/lib/actions/shared"
import { maintenanceHistorySchema } from "@/lib/schemas/maintenance"
import { revalidatePath } from "next/cache"

export async function registerMaintenanceHistory(
  maintenanceId: string,
  date?: string,
): Promise<{ error?: string }> {
  const parsed = maintenanceHistorySchema.safeParse({
    maintenance_id: maintenanceId,
    date: date,
  })

  if (!parsed.success) {
    return { error: "Mantenimiento invalido" }
  }

  try {
    const supabase = await assertAdmin()

    const insertObj: Record<string, unknown> = {
      maintenance_id: parsed.data.maintenance_id,
    }

    if (parsed.data.date) {
      insertObj.date = new Date(parsed.data.date).toISOString()
    }

    const { error } = await supabase
      .from("maintenance_history")
      .insert(insertObj)

    if (error) return { error: error.message }

    revalidatePath("/admin/maintenance")
    return {}
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
