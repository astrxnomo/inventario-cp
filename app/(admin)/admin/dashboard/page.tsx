import { DashboardKpis } from "@/components/admin/dashboard-kpis"
import { DataTable as DashboardExampleTable } from "@/components/data-table"
import { RefreshButton } from "@/components/ui/refresh-button"
import { getDashboardKpis } from "@/lib/data/dashboard/get-dashboard"
import { createClient } from "@/lib/supabase/server"
import data from "./data.json"

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const kpis = await getDashboardKpis(supabase)

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

      <DashboardKpis kpis={kpis} />

      <section className="mt-6 rounded-xl border bg-card">
        <div className="border-b px-4 py-3 sm:px-6">
          <h2 className="text-base font-semibold">Pipeline de documentos</h2>
          <p className="text-sm text-muted-foreground">
            Vista tipo dashboard-01 con tabla interactiva
          </p>
        </div>
        <DashboardExampleTable data={data} />
      </section>
    </main>
  )
}
