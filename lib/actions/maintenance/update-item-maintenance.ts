"use server"

import { assertAdmin } from "@/lib/actions/shared"
import { itemMaintenanceSchema } from "@/lib/schemas/maintenance"
import { revalidatePath } from "next/cache"

export async function updateItemMaintenance(
  id: string,
  payload: {
    item_id: string
    interval_days: number
    description?: string | null
  },
): Promise<{ error?: string }> {
  const parsed = itemMaintenanceSchema.safeParse(payload)

  if (!parsed.success) {
    return { error: "Datos de mantenimiento invalidos" }
  }

  try {
    const supabase = await assertAdmin()

    const { data: currentRow, error: currentRowError } = await supabase
      .from("items_maintenance")
      .select("id,item_id")
      .eq("id", id)
      .maybeSingle()

    if (currentRowError) return { error: currentRowError.message }
    if (!currentRow) return { error: "Mantenimiento no encontrado" }

    const { count: historyCount, error: historyCountError } = await supabase
      .from("maintenance_history")
      .select("id", { count: "exact", head: true })
      .eq("maintenance_id", id)

    if (historyCountError) return { error: historyCountError.message }
    const hasHistory = (historyCount ?? 0) > 0

    if (hasHistory && parsed.data.item_id !== currentRow.item_id) {
      return {
        error:
          "Este mantenimiento ya tiene historial. Puedes actualizar intervalo y descripcion, pero no cambiar el item.",
      }
    }

    const updatePayload = {
      item_id: parsed.data.item_id,
      interval_days: parsed.data.interval_days,
      description: parsed.data.description ?? null,
    }

    const { error } = await supabase
      .from("items_maintenance")
      .update(updatePayload)
      .eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/admin/maintenance")
    return {}
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
