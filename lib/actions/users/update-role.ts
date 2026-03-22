"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Skeleton server action: change_user_role stored procedure exists in DB
export async function updateUserRole(
  targetUserId: string,
  newRole: string,
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user: currentUser },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !currentUser) {
    return { error: "No autenticado" }
  }

  if (currentUser.id === targetUserId) {
    return { error: "No puedes cambiar tu propio rol." }
  }

  // Verify caller has root privileges
  const { data: isRoot, error: rootCheckError } = await supabase.rpc("is_root")

  if (rootCheckError) {
    console.error("Error checking root privileges:", rootCheckError)
    return { error: "Error verificando permisos" }
  }

  if (!isRoot) {
    return { error: "No autorizado. Se requieren permisos de Root." }
  }

  const { error } = await supabase.rpc("change_user_role", {
    p_new_role: newRole,
    p_target_user_id: targetUserId,
  })
  if (error) return { error: error.message }
  revalidatePath("/admin/users")
  return {}
}
