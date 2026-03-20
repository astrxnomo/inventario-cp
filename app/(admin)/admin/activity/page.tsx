import { ActivityTable } from "@/components/admin/activity-table"
import { RefreshButton } from "@/components/ui/refresh-button"
import { getAccessLogs } from "@/lib/data/logs/get-logs"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminActivityPage() {
  const current = await getCurrentUser()
  if (!current) redirect("/login")

  const supabase = await createClient()
  const accessLogs = await getAccessLogs(supabase)

  return (
    <main id="main-content" className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Actividad
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Registro de accesos físicos a los gabinetes
          </p>
        </div>
        <RefreshButton />
      </div>

      <ActivityTable accessLogs={accessLogs} />
    </main>
  )
}
