import "server-only"

import { createClient } from "@/lib/supabase/server"

export async function getPendingUsersCount(): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "pending")

  if (error) {
    console.error("Error fetching pending users count:", error)
    return 0
  }

  return count ?? 0
}
