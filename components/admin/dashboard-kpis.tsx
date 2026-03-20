import type { DashboardKpis } from "@/lib/types/users"
import { Activity, LayoutGrid, Lock, Package, Users } from "lucide-react"

const CARDS = (kpis: DashboardKpis) => [
  {
    label: "Gabinetes",
    value: kpis.totalCabinets,
    icon: LayoutGrid,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Artículos registrados",
    value: kpis.totalItems,
    icon: Package,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Sesiones activas",
    value: kpis.activeSessions,
    icon: Activity,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    label: "Usuarios pendientes",
    value: kpis.pendingUsers,
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Gabinetes bloqueados",
    value: kpis.lockedCabinets,
    icon: Lock,
    color: "text-red-600",
    bg: "bg-red-50",
  },
]

export function DashboardKpis({ kpis }: { kpis: DashboardKpis }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS(kpis).map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${card.bg}`}>
              <Icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {card.value}
            </div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              {card.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
