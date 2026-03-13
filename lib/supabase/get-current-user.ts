import { createClient } from "@/lib/supabase/server"
import { cache } from "react"

/**
 * Returns the authenticated user + profile for the current request.
 * Wrapped in React.cache so layout + page components share a single DB read
 * per request instead of each making their own round-trip.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  return { user, profile }
})
