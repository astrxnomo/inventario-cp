"use server"

import {
  assertAdmin,
  collectFieldErrors,
  type AdminFormState,
} from "@/lib/actions/shared"
import { cabinetSchema } from "@/lib/schemas/cabinets"
import { revalidatePath } from "next/cache"

export async function updateCabinet(
  id: string,
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const result = cabinetSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    location: formData.get("location") || undefined,
  })
  if (!result.success) {
    return { fieldErrors: collectFieldErrors(result.error.issues) }
  }
  try {
    const supabase = await assertAdmin()
    const { error } = await supabase
      .from("cabinets")
      .update({
        name: result.data.name,
        description: result.data.description ?? null,
        location: result.data.location ?? null,
      })
      .eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/admin/cabinets")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
