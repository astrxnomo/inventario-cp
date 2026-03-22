"use server"

import {
  assertAdmin,
  collectFieldErrors,
  type AdminFormState,
} from "@/lib/actions/shared"
import { categoryNameSchema } from "@/lib/schemas/categories"
import { revalidatePath } from "next/cache"

export async function updateCategory(
  id: string,
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
      .update({ name: result.data.name })
      .eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/admin/categories")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
