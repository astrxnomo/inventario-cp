"use server"

import { assertAdmin } from "@/lib/actions/shared"
import { revalidatePath } from "next/cache"

export async function setCabinetStatus(
  id: string,
  status: "available" | "in_use" | "locked",
): Promise<{ error?: string }> {
  try {
    const supabase = await assertAdmin()
    const { error } = await supabase.from("cabinets").update({ status }).eq(
      "id",
      id,
    )
    if (error) return { error: error.message }
    revalidatePath("/admin/cabinets")
    return {}
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
