import type { DashboardAnalytics } from "@/lib/data/dashboard/get-dashboard"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { TabsContent } from "@/components/ui/tabs"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { movementByCategoryConfig, topItemsConfig } from "./chart-config"
import { ChartCard } from "./chart-card"

export function InventoryTab({ analytics }: { analytics: DashboardAnalytics }) {
  return (
    <TabsContent value="inventory" className="flex flex-col gap-4">
      <ChartCard
        className="lg:col-span-2"
        title="Top items por rotación"
        description="Items con mayor movimiento total"
      >
        <ChartContainer config={topItemsConfig} className="h-[300px] w-full">
          <BarChart
            data={analytics.tabs.inventory.breakdowns.topItemsByMovement}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="itemName"
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
            <Bar dataKey="movements" fill="var(--color-movements)" radius={4} />
          </BarChart>
        </ChartContainer>
      </ChartCard>

      <ChartCard
        title="Movimientos por categoría"
        description="Comparativa de retiros y devoluciones"
      >
        <ChartContainer
          config={movementByCategoryConfig}
          className="h-[300px] w-full"
        >
          <BarChart
            data={analytics.tabs.inventory.breakdowns.movementByCategory}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
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
            <Bar dataKey="withdrawn" fill="var(--color-withdrawn)" radius={4} />
            <Bar dataKey="returned" fill="var(--color-returned)" radius={4} />
          </BarChart>
        </ChartContainer>
      </ChartCard>
    </TabsContent>
  )
}
