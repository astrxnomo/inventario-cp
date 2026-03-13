import { createClient } from "@/lib/supabase/server"

// ─── Shared form state for admin actions ─────────────────────────────────────
// Used with useActionState — keeps field-level errors + top-level error/success.
export type AdminFormState = {
  fieldErrors?: Record<string, string>
  error?: string | null
  success?: boolean
}

// ─── Auth guard ───────────────────────────────────────────────────────────────
// Throws if the caller is not authenticated or is not an admin/root.
// Returns the authenticated Supabase client for chaining.
export async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")
  const { data: isAdmin } = await supabase.rpc("is_admin")
  if (!isAdmin) throw new Error("Sin permisos de administrador")
  return supabase
}

// ─── Zod error normalizer ─────────────────────────────────────────────────────
export function collectFieldErrors(
  issues: Array<{ path: PropertyKey[]; message: string }>,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of issues) {
    const key = issue.path[0]
    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message
    }
  }
  return errors
}
