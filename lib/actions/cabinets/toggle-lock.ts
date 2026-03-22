"use server"

import { assertAdmin } from "@/lib/actions/shared"
import { revalidatePath } from "next/cache"

export async function toggleCabinetLock(
  id: string,
  lock: boolean,
): Promise<{ error?: string }> {
  try {
    const supabase = await assertAdmin()
    const status = lock ? "locked" : "available"
    const { error } = await supabase
      .from("cabinets")
      .update({ status })
      .eq("id", id)
    if (error) return { error: error.message }
    revalidatePath("/admin/cabinets")
    return {}
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
