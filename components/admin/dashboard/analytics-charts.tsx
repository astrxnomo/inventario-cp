"use client"

import type { DashboardAnalytics } from "@/lib/data/dashboard/get-dashboard"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryTab } from "@/components/admin/dashboard/analytics/inventory-tab"
import { MaintenanceTab } from "@/components/admin/dashboard/analytics/maintenance-tab"
import { OperationsTab } from "@/components/admin/dashboard/analytics/operations-tab"
import { OverviewTab } from "@/components/admin/dashboard/analytics/overview-tab"
import { ReservationsTab } from "@/components/admin/dashboard/analytics/reservations-tab"

export function AnalyticsCharts({
  analytics,
}: {
  analytics: DashboardAnalytics
}) {
  return (
    <section className="mt-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="operations">Operación</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="reservations">Reservas</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
        </TabsList>

        <OverviewTab analytics={analytics} />
        <OperationsTab analytics={analytics} />
        <InventoryTab analytics={analytics} />
        <ReservationsTab analytics={analytics} />
        <MaintenanceTab analytics={analytics} />
      </Tabs>
    </section>
  )
}
