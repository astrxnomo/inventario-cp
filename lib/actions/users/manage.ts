"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ─── Authorize pending user ────────────────────────────────────────────────────
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

// ─── Change user role ─────────────────────────────────────────────────────────
export async function changeUserRole(
  targetUserId: string,
  newRole: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.rpc("change_user_role", {
    p_target_user_id: targetUserId,
    p_new_role: newRole,
  })
  if (error) return { error: error.message }
  revalidatePath("/admin/users")
  return {}
}
