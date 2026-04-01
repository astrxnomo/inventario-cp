import { AnalyticsCharts } from "@/components/admin/dashboard/analytics-charts"
import { Kpis } from "@/components/admin/dashboard/kpis"

import { RefreshButton } from "@/components/ui/refresh-button"
import {
  getDashboardAnalytics,
  getDashboardKpis,
} from "@/lib/data/dashboard/get-dashboard"

export default async function AdminDashboardPage() {
  const [kpis, analytics] = await Promise.all([
    getDashboardKpis(),
    getDashboardAnalytics(30),
  ])

  return (
    <main id="main-content" className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Resumen general del sistema
          </p>
        </div>
        <RefreshButton />
      </div>

      <Kpis kpis={kpis} />
      <AnalyticsCharts analytics={analytics} />
    </main>
  )
}
