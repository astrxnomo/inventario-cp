"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function authorizeUser(
  targetUserId: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.rpc("authorize_user", {
    p_target_user_id: targetUserId,
  })
  if (error) return { error: error.message }
  revalidatePath("/admin/users")
  return {}
}
