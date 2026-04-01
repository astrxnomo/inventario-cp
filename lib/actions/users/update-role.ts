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

  const { data: callerProfile, error: callerProfileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single<{ role: "root" | "admin" | "user" | "pending" | "denied" }>()

  if (callerProfileError || !callerProfile) {
    return { error: "No se pudo verificar el rol del usuario actual." }
  }

  const callerRole = callerProfile.role

  if (!["admin", "root"].includes(callerRole)) {
    return {
      error: "No autorizado. Se requieren permisos de administrador o root.",
    }
  }

  const { data: targetProfile, error: targetProfileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .single<{ role: "root" | "admin" | "user" | "pending" | "denied" }>()

  if (targetProfileError || !targetProfile) {
    return { error: "No se pudo verificar el rol del usuario objetivo." }
  }

  if (
    callerRole === "admin" &&
    ["admin", "root"].includes(targetProfile.role)
  ) {
    return {
      error:
        "No autorizado: admin no puede cambiar el rol de usuarios admin o root.",
    }
  }

  if (
    callerRole === "admin" &&
    !["user", "pending", "denied"].includes(newRole)
  ) {
    return {
      error:
        "No autorizado: admin solo puede asignar roles usuario, pendiente o restringido.",
    }
  }

  const { error } = await supabase.rpc("change_user_role", {
    p_new_role: newRole,
    p_target_user_id: targetUserId,
  })
  if (error) return { error: error.message }
  revalidatePath("/admin/users")
  return {}
}
