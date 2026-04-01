import type { ChartConfig } from "@/components/ui/chart"

export const utilizationConfig = {
  sessions: { label: "Sesiones", color: "#06b6d4" },
} satisfies ChartConfig

export const accessFunnelConfig = {
  count: { label: "Eventos", color: "#14b8a6" },
} satisfies ChartConfig

export const cabinetStatusConfig = {
  available: { label: "Disponibles", color: "#10b981" },
  in_use: { label: "En uso", color: "#3b82f6" },
  locked: { label: "Bloqueados", color: "#ef4444" },
} satisfies ChartConfig

export const reservationStatusConfig = {
  active: { label: "Activas", color: "#06b6d4" },
  completed: { label: "Completadas", color: "#10b981" },
  expired: { label: "Expiradas", color: "#ef4444" },
  cancelled: { label: "Canceladas", color: "#ef4444" },
} satisfies ChartConfig

export const sessionDurationConfig = {
  avgMinutes: { label: "Promedio (min)", color: "#06b6d4" },
  p95Minutes: { label: "P95 (min)", color: "#8b5cf6" },
} satisfies ChartConfig

export const accessByDayConfig = {
  requested: { label: "Solicitado", color: "#06b6d4" },
  granted: { label: "Aprobado", color: "#10b981" },
  denied: { label: "Rechazado", color: "#ef4444" },
} satisfies ChartConfig

export const usageByHourConfig = {
  events: { label: "Eventos", color: "#3b82f6" },
} satisfies ChartConfig

export const inventoryFlowConfig = {
  withdrawn: { label: "Retiros", color: "#8b5cf6" },
  returned: { label: "Devoluciones", color: "#10b981" },
} satisfies ChartConfig

export const movementByCategoryConfig = {
  withdrawn: { label: "Retiros", color: "#06b6d4" },
  returned: { label: "Devoluciones", color: "#14b8a6" },
} satisfies ChartConfig

export const topItemsConfig = {
  movements: { label: "Movimientos", color: "#06b6d4" },
} satisfies ChartConfig

export const reservationBacklogConfig = {
  active: { label: "Activas", color: "#06b6d4" },
  completed: { label: "Completadas", color: "#10b981" },
  expired: { label: "Expiradas", color: "#ef4444" },
} satisfies ChartConfig

export const reservationActiveBacklogConfig = {
  active: { label: "Activas", color: "#06b6d4" },
} satisfies ChartConfig

export const reservationRegisteredStatusConfig = {
  completed: { label: "Completadas", color: "#10b981" },
  cancelled: { label: "Canceladas", color: "#ef4444" },
} satisfies ChartConfig

export const maintenanceRiskConfig = {
  overdue: { label: "Vencido", color: "#ef4444" },
  dueSoon: { label: "Próximo", color: "#f59e0b" },
  healthy: { label: "Saludable", color: "#10b981" },
} satisfies ChartConfig

export const maintenanceTrendConfig = {
  overdue: { label: "Vencido", color: "#ef4444" },
  dueSoon: { label: "Próximo", color: "#f59e0b" },
  healthy: { label: "Saludable", color: "#10b981" },
} satisfies ChartConfig
