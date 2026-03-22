"use server"

import {
  assertAdmin,
  collectFieldErrors,
  type AdminFormState,
} from "@/lib/actions/shared"
import { inventoryItemSchema } from "@/lib/schemas/inventory"
import { revalidatePath } from "next/cache"

export async function createItem(
  cabinetId: string,
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const result = inventoryItemSchema.safeParse({
    name: formData.get("name"),
    quantity: formData.get("quantity"),
    category_id: formData.get("category_id"),
  })
  if (!result.success) {
    return { fieldErrors: collectFieldErrors(result.error.issues) }
  }
  try {
    const supabase = await assertAdmin()
    const { error } = await supabase.from("inventory_items").insert({
      ...result.data,
      cabinet_id: cabinetId,
    })
    if (error) return { error: error.message }
    revalidatePath("/admin/cabinets")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
