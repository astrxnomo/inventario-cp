"use server"

import { assertAdmin } from "@/lib/actions/shared"
import { revalidatePath } from "next/cache"

export async function unlockAllCabinets(): Promise<{ error?: string }> {
  try {
    const supabase = await assertAdmin()
    const { data, error } = await supabase.rpc("unlock_all_cabinets")
    if (error) return { error: error.message }
    revalidatePath("/admin/cabinets")
    return {}
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
