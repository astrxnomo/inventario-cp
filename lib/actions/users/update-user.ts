"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUser(
  userId: string,
  data: { full_name?: string; email?: string },
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId)

  if (error) return { error: error.message }
  revalidatePath("/admin/users")
  return {}
}
