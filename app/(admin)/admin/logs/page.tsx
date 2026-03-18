import dynamic from "next/dynamic"
import { RefreshButton } from "@/components/ui/refresh-button"
import { getAccessLogs, getSessionsWithItems } from "@/lib/data/logs/get-logs"
import { getAllReservations } from "@/lib/data/reservations/get-reservations"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const LogsView = dynamic(
  () => import("@/components/admin/logs-view").then((mod) => mod.LogsView),
  {
    loading: () => (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
        Cargando actividad...
      </div>
    ),
  },
)

export default async function AdminLogsPage() {
  const current = await getCurrentUser()
  if (!current) redirect("/login")

  const supabase = await createClient()

  const [sessions, accessLogs, reservations] = await Promise.all([
    getSessionsWithItems(supabase),
    getAccessLogs(supabase),
    getAllReservations(supabase, current.user.id),
  ])

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Actividad
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Últimas 100 sesiones · ordenadas por fecha descendente
          </p>
        </div>
        <RefreshButton />
      </div>

      <LogsView
        sessions={sessions}
        accessLogs={accessLogs}
        reservations={reservations}
      />
    </main>
  )
}
