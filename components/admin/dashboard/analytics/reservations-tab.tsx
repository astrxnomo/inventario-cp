import type { DashboardAnalytics } from "@/lib/data/dashboard/get-dashboard"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { TabsContent } from "@/components/ui/tabs"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { reservationRegisteredStatusConfig } from "./chart-config"
import { ChartCard } from "./chart-card"
import { shortDayLabel } from "./helpers"

export function ReservationsTab({
  analytics,
}: {
  analytics: DashboardAnalytics
}) {
  return (
    <TabsContent value="reservations">
      <ChartCard
        title="Reservas registradas por día"
        description="Clasificadas en completadas y canceladas"
      >
        <ChartContainer
          config={reservationRegisteredStatusConfig}
          className="h-[320px] w-full"
        >
          <BarChart data={analytics.tabs.reservations.series.registeredByDay}>
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
            <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
            <Bar dataKey="cancelled" fill="var(--color-cancelled)" radius={4} />
          </BarChart>
        </ChartContainer>
      </ChartCard>
    </TabsContent>
  )
}
