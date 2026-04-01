import type { DashboardAnalytics } from "@/lib/data/dashboard/get-dashboard"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { TabsContent } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  cabinetStatusConfig,
  reservationStatusConfig,
  utilizationConfig,
} from "./chart-config"
import { ChartCard, EmptyChartState } from "./chart-card"
import { getPieSliceColor } from "./helpers"

export function OverviewTab({ analytics }: { analytics: DashboardAnalytics }) {
  return (
    <TabsContent value="overview" className="grid gap-4 lg:grid-cols-2">
      <ChartCard
        title="Utilización por gabinete"
        description={`Ranking de sesiones en ${analytics.periodDays} días`}
        className="lg:col-span-2"
      >
        {analytics.tabs.overview.charts.cabinetUtilization.length === 0 ? (
          <EmptyChartState message="No hay datos de utilización" />
        ) : (
          <ChartContainer
            config={utilizationConfig}
            className="h-[300px] w-full"
          >
            <BarChart data={analytics.tabs.overview.charts.cabinetUtilization}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="cabinetName"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sessions" fill="var(--color-sessions)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </ChartCard>

      <ChartCard
        title="Estado de gabinetes"
        description="Composición actual del parque"
      >
        {analytics.tabs.overview.breakdowns.cabinetStatus.length === 0 ? (
          <EmptyChartState message="No hay datos de gabinetes" />
        ) : (
          <ChartContainer
            config={cabinetStatusConfig}
            className="h-[300px] w-full"
          >
            <PieChart>
              <Pie
                data={analytics.tabs.overview.breakdowns.cabinetStatus}
                dataKey="count"
                nameKey="status"
              >
                {analytics.tabs.overview.breakdowns.cabinetStatus.map(
                  (entry) => (
                    <Cell
                      key={`cabinet-status-${entry.status}`}
                      fill={getPieSliceColor(cabinetStatusConfig, entry.status)}
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

      <ChartCard
        title="Estado de reservas"
        description="Distribución por estatus"
      >
        {analytics.tabs.overview.breakdowns.reservationStatus.length === 0 ? (
          <EmptyChartState message="No hay datos de reservas" />
        ) : (
          <ChartContainer
            config={reservationStatusConfig}
            className="h-[300px] w-full"
          >
            <PieChart>
              <Pie
                data={analytics.tabs.overview.breakdowns.reservationStatus}
                dataKey="count"
                nameKey="status"
              >
                {analytics.tabs.overview.breakdowns.reservationStatus.map(
                  (entry) => (
                    <Cell
                      key={`reservation-status-${entry.status}`}
                      fill={getPieSliceColor(
                        reservationStatusConfig,
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
