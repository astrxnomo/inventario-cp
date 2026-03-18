import { DashboardKpis } from "@/components/admin/dashboard-kpis"
import { RefreshButton } from "@/components/ui/refresh-button"
import { getDashboardKpis } from "@/lib/data/dashboard/get-dashboard"
import { createClient } from "@/lib/supabase/server"

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const kpis = await getDashboardKpis(supabase)

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Resumen general del sistema
          </p>
        </div>
        <RefreshButton />
      </div>

      <DashboardKpis kpis={kpis} />
    </main>
  )
}
