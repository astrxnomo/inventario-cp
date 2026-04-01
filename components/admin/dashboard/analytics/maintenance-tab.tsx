import type { DashboardAnalytics } from "@/lib/data/dashboard/get-dashboard"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { TabsContent } from "@/components/ui/tabs"
import { Cell, Pie, PieChart } from "recharts"
import { maintenanceRiskConfig } from "./chart-config"
import { ChartCard, EmptyChartState } from "./chart-card"
import { getPieSliceColor } from "./helpers"

export function MaintenanceTab({
  analytics,
}: {
  analytics: DashboardAnalytics
}) {
  return (
    <TabsContent value="maintenance">
      <ChartCard
        title="Riesgo de mantenimiento"
        description="Distribución actual del estado"
      >
        {analytics.tabs.maintenance.breakdowns.riskDistribution.length === 0 ? (
          <EmptyChartState message="No hay historial de mantenimiento para calcular riesgo" />
        ) : (
          <ChartContainer
            config={maintenanceRiskConfig}
            className="h-[300px] w-full"
          >
            <PieChart>
              <Pie
                data={analytics.tabs.maintenance.breakdowns.riskDistribution}
                dataKey="count"
                nameKey="status"
              >
                {analytics.tabs.maintenance.breakdowns.riskDistribution.map(
                  (entry) => (
                    <Cell
                      key={`maintenance-risk-${entry.status}`}
                      fill={getPieSliceColor(
                        maintenanceRiskConfig,
                        entry.status,
                      )}
                    />
                  ),
                )}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ChartContainer>
        )}
      </ChartCard>
    </TabsContent>
  )
}
