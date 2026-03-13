import type { Database } from "@/lib/supabase/types"
import type { AdminUser } from "@/lib/types/users"
import type { SupabaseClient } from "@supabase/supabase-js"

export type { AdminUser }

export async function getAdminUserList(
  supabase: SupabaseClient<Database>,
): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc("get_admin_user_list")
  if (error) throw new Error(error.message)
  return (data ?? []) as AdminUser[]
}
