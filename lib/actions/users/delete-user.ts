"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.rpc("delete_user", { user_id: userId })

  if (error) {
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId)

    if (profileError) return { error: profileError.message }
  }

  revalidatePath("/admin/users")
  return {}
}
