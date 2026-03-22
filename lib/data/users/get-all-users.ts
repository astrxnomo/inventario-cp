import { createClient } from "@/lib/supabase/server"

export type UserProfile = {
  id: string
  user_id: string
  email: string
  full_name: string | null
  role: "pending" | "user" | "admin" | "root"
  created_at: string
}

export async function getAllUsers(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  return data ?? []
}
