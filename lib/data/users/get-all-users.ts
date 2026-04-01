import "server-only"

import { createClient } from "@/lib/supabase/server"

export type UserProfile = {
  id: string
  user_id: string
  email: string
  full_name: string | null
  role: "pending" | "denied" | "user" | "admin" | "root"
  created_at: string
}

type ProfileRow = {
  id: string
  full_name: string | null
  role: "pending" | "denied" | "user" | "admin" | "root"
  created_at: string
  email: string | null
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const client = await createClient()

  const { data: profiles, error } = await client
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching profiles:", error)
    return []
  }

  return (profiles as ProfileRow[]).map((p) => ({
    id: p.id,
    user_id: p.id,
    full_name: p.full_name,
    role: p.role,
    created_at: p.created_at,
    email: p.email ?? "",
  }))
}
