import { UsersTable } from "@/components/admin/users-table"
import { RefreshButton } from "@/components/ui/refresh-button"
import { getAdminUserList } from "@/lib/data/users/get-users"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { createClient } from "@/lib/supabase/server"

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const [users, current] = await Promise.all([
    getAdminUserList(supabase),
    getCurrentUser(),
  ])

  const pending = users.filter((u) => u.role === "pending").length

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Gestión de usuarios
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {users.length} usuario{users.length !== 1 ? "s" : ""} registrado
            {users.length !== 1 ? "s" : ""}
            {pending > 0 && (
              <span className="ml-2 font-medium text-amber-600">
                · {pending} pendiente{pending !== 1 ? "s" : ""} de autorización
              </span>
            )}
          </p>
        </div>
        <RefreshButton />
      </div>

      <UsersTable users={users} callerRole={current!.profile!.role} />
    </main>
  )
}
