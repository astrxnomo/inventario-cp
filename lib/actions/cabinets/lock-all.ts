"use server"

import { assertAdmin } from "@/lib/actions/shared"
import { revalidatePath } from "next/cache"

export async function lockAllCabinets(): Promise<{ error?: string }> {
  try {
    const supabase = await assertAdmin()
    // Prefer calling the DB RPC which performs an atomic update and returns affected rows
    const { error } = await supabase.rpc("lock_all_cabinets")
    if (error) return { error: error.message }
    revalidatePath("/admin/cabinets")
    return {}
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}
