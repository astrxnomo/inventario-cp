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
    <main id="main-content" className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestión de usuarios
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
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
