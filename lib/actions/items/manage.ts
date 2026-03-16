"use server"

import {
  assertAdmin,
  collectFieldErrors,
  type AdminFormState,
} from "@/lib/actions/shared"
import { inventoryItemSchema } from "@/lib/schemas/items"
import { revalidatePath } from "next/cache"

// ─── Create ───────────────────────────────────────────────────────────────────
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

// ─── Update ───────────────────────────────────────────────────────────────────
export async function updateItem(
  id: string,
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
    const { error } = await supabase
      .from("inventory_items")
      .update(result.data)
      .eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/admin/cabinets")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}

// ─── Delete (imperative) ──────────────────────────────────────────────────────
export async function deleteItem(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await assertAdmin()
    const { error } = await supabase
      .from("inventory_items")
      .delete()
      .eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/admin/cabinets")
    return {}
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
