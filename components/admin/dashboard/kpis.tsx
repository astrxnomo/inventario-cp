import type { DashboardKpis } from "@/lib/types/users"
import type { ComponentType } from "react"
import {
  Activity,
  AlertCircle,
  LayoutGrid,
  Package,
  TrendingUp,
  Users,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DashboardKpisProps = {
  kpis: DashboardKpis
}

type KpiValueKey = keyof Pick<
  DashboardKpis,
  | "totalCabinets"
  | "totalItems"
  | "activeSessions"
  | "pendingUsers"
  | "lockedCabinets"
>

type KpiIcon = ComponentType<{ className?: string }>

type KpiCardConfig = {
  label: string
  valueKey: KpiValueKey
  icon: KpiIcon
  color: string
  bg: string
  borderColor: string
  trend: string
  trendIcon: KpiIcon
  showAlert?: (kpis: DashboardKpis) => boolean
}

type KpiCardData = Omit<KpiCardConfig, "valueKey" | "showAlert"> & {
  value: number
  alert: boolean
}

const KPI_CARD_CONFIGS: readonly KpiCardConfig[] = [
  {
    label: "Total de Gabinetes",
    valueKey: "totalCabinets",
    icon: LayoutGrid,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    trend: "+2 este mes",
    trendIcon: TrendingUp,
  },
  {
    label: "Artículos Registrados",
    valueKey: "totalItems",
    icon: Package,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    trend: "Inventario actualizado",
    trendIcon: Package,
  },
  {
    label: "Sesiones Activas",
    valueKey: "activeSessions",
    icon: Activity,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    trend: "Gabinetes en uso",
    trendIcon: Activity,
  },
  {
    label: "Usuarios Pendientes",
    valueKey: "pendingUsers",
    icon: Users,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    trend: "Requieren aprobación",
    trendIcon: AlertCircle,
    showAlert: ({ pendingUsers }) => pendingUsers > 0,
  },
]

function buildKpiCards(kpis: DashboardKpis): KpiCardData[] {
  return KPI_CARD_CONFIGS.map(({ valueKey, showAlert, ...config }) => ({
    ...config,
    value: kpis[valueKey],
    alert: showAlert?.(kpis) ?? false,
  }))
}

function KpiCard({ card }: { card: KpiCardData }) {
  const Icon = card.icon

  return (
    <Card
      className={`relative overflow-hidden border-l-4 transition-all hover:shadow-lg ${card.borderColor}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {card.label}
        </CardTitle>
        <div className={`rounded-xl p-2.5 ${card.bg}`}>
          <Icon className={`h-5 w-5 ${card.color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight tabular-nums">
          {card.value}
        </div>
      </CardContent>
      {card.alert && (
        <div className="absolute top-2 right-2">
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
          </div>
        </div>
      )}
    </Card>
  )
}

export function Kpis({ kpis }: DashboardKpisProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {buildKpiCards(kpis).map((card) => (
        <KpiCard key={card.label} card={card} />
      ))}
    </div>
  )
}
