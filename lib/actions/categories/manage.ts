"use server"

import {
  assertAdmin,
  collectFieldErrors,
  type AdminFormState,
} from "@/lib/actions/shared"
import { categoryNameSchema } from "@/lib/schemas/categories"
import { revalidatePath } from "next/cache"

// ─── Create ───────────────────────────────────────────────────────────────────
export async function createCategory(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const result = categoryNameSchema.safeParse({ name: formData.get("name") })
  if (!result.success) {
    return { fieldErrors: collectFieldErrors(result.error.issues) }
  }
  try {
    const supabase = await assertAdmin()
    const { error } = await supabase
      .from("inventory_categories")
      .insert({ name: result.data.name })
    if (error) return { error: error.message }
    revalidatePath("/admin/cabinets")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}

// ─── Delete (imperative) ──────────────────────────────────────────────────────
export async function deleteCategory(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await assertAdmin()
    const { error } = await supabase
      .from("inventory_categories")
      .delete()
      .eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/admin/cabinets")
    return {}
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
