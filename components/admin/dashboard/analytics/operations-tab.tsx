import type { DashboardAnalytics } from "@/lib/data/dashboard/get-dashboard"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { TabsContent } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  accessByDayConfig,
  sessionDurationConfig,
  usageByHourConfig,
} from "./chart-config"
import { ChartCard } from "./chart-card"
import { shortDayLabel } from "./helpers"

export function OperationsTab({
  analytics,
}: {
  analytics: DashboardAnalytics
}) {
  return (
    <TabsContent value="operations" className="grid gap-4 lg:grid-cols-2">
      <ChartCard
        title="Duración de sesiones"
        description="Promedio y percentil 95 por día"
      >
        <ChartContainer
          config={sessionDurationConfig}
          className="h-[300px] w-full"
        >
          <LineChart
            data={analytics.tabs.operations.series.sessionDurationByDay}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={shortDayLabel}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => shortDayLabel(value)}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="avgMinutes"
              stroke="var(--color-avgMinutes)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="p95Minutes"
              stroke="var(--color-p95Minutes)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </ChartCard>

      <ChartCard
        title="Accesos por día"
        description="Tendencia de solicitudes y resultados"
      >
        <ChartContainer config={accessByDayConfig} className="h-[300px] w-full">
          <LineChart data={analytics.tabs.operations.series.accessByDay}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={shortDayLabel}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => shortDayLabel(value)}
                />
              }
            />

            <Line
              type="monotone"
              dataKey="granted"
              stroke="var(--color-granted)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </ChartCard>

      <ChartCard
        className="lg:col-span-2"
        title="Horas pico"
        description="Eventos de acceso por hora del día"
      >
        <ChartContainer config={usageByHourConfig} className="h-[300px] w-full">
          <BarChart data={analytics.tabs.operations.series.usageByHour}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
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
            <Bar dataKey="events" fill="var(--color-events)" radius={4} />
          </BarChart>
        </ChartContainer>
      </ChartCard>
    </TabsContent>
  )
}
