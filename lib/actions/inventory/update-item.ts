"use server"

import {
  assertAdmin,
  collectFieldErrors,
  type AdminFormState,
} from "@/lib/actions/shared"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateItemSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  quantity: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(0, "La cantidad debe ser mayor o igual a 0"),
  category_id: z.string().optional().nullable(),
  cabinet_id: z.string().min(1, "El gabinete es requerido"),
})

export async function updateItem(
  id: string,
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const result = updateItemSchema.safeParse({
    name: formData.get("name"),
    quantity: formData.get("quantity"),
    category_id:
      formData.get("category_id") === "null" ||
      formData.get("category_id") === ""
        ? null
        : formData.get("category_id"),
    cabinet_id: formData.get("cabinet_id"),
  })

  if (!result.success) {
    return { fieldErrors: collectFieldErrors(result.error.issues) }
  }

  try {
    const supabase = await assertAdmin()

    // Check if cabinet exists
    const { data: cabinet, error: cabinetError } = await supabase
      .from("cabinets")
      .select("id")
      .eq("id", result.data.cabinet_id)
      .single()

    if (cabinetError || !cabinet) {
      return { error: "El gabinete seleccionado no existe." }
    }

    const { error } = await supabase
      .from("inventory_items")
      .update({
        name: result.data.name,
        quantity: result.data.quantity,
        category_id: result.data.category_id,
        cabinet_id: result.data.cabinet_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/admin/inventory")
    revalidatePath(`/admin/inventory/${id}`)

    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
