import { createClient } from "@/lib/supabase/server"

import type { DashboardKpis } from "@/lib/types/users"

export type { DashboardKpis }

type DaySeriesPoint = {
  day: string
}

type OverviewTab = {
  kpis: {
    utilizationRate: number
    accessApprovalRate: number
    deniedAccessRate: number
  }
  breakdowns: {
    cabinetStatus: Array<{ status: string; count: number }>
    reservationStatus: Array<{ status: string; count: number }>
  }
  charts: {
    cabinetUtilization: Array<{
      cabinetId: string
      cabinetName: string
      sessions: number
      utilizationPct: number
    }>
    accessFunnel: Array<{ stage: string; count: number }>
  }
}

type OperationsTab = {
  kpis: {
    avgSessionMinutes: number
    p95SessionMinutes: number
  }
  series: {
    sessionDurationByDay: Array<
      DaySeriesPoint & { avgMinutes: number; p95Minutes: number }
    >
    accessByDay: Array<
      DaySeriesPoint & {
        requested: number
        granted: number
        denied: number
        closed: number
      }
    >
    usageByHour: Array<{ hour: number; label: string; events: number }>
  }
}

type InventoryTab = {
  kpis: {
    totalWithdrawn: number
    totalReturned: number
    netMovement: number
  }
  series: {
    inventoryFlowByDay: Array<
      DaySeriesPoint & { withdrawn: number; returned: number; net: number }
    >
  }
  breakdowns: {
    movementByCategory: Array<{
      category: string
      withdrawn: number
      returned: number
    }>
    topItemsByMovement: Array<{
      itemId: string
      itemName: string
      movements: number
    }>
  }
}

type ReservationsTab = {
  kpis: {
    active: number
    completed: number
    cancelled: number
  }
  series: {
    registeredByDay: Array<
      DaySeriesPoint & { completed: number; cancelled: number }
    >
  }
}

type MaintenanceTab = {
  kpis: {
    overdue: number
    dueSoon: number
    healthy: number
  }
  breakdowns: {
    riskDistribution: Array<{ status: string; count: number }>
  }
  series: {
    maintenanceTrendByDay: Array<
      DaySeriesPoint & { overdue: number; dueSoon: number; healthy: number }
    >
  }
}

export type DashboardAnalytics = {
  generatedAt: string
  periodDays: number
  summary: DashboardKpis & {
    activeReservations: number
    overdueMaintenance: number
  }
  tabs: {
    overview: OverviewTab
    operations: OperationsTab
    inventory: InventoryTab
    reservations: ReservationsTab
    maintenance: MaintenanceTab
  }
}

const EMPTY_ANALYTICS: DashboardAnalytics = {
  generatedAt: new Date(0).toISOString(),
  periodDays: 30,
  summary: {
    totalCabinets: 0,
    totalItems: 0,
    activeSessions: 0,
    pendingUsers: 0,
    lockedCabinets: 0,
    activeReservations: 0,
    overdueMaintenance: 0,
  },
  tabs: {
    overview: {
      kpis: {
        utilizationRate: 0,
        accessApprovalRate: 0,
        deniedAccessRate: 0,
      },
      breakdowns: {
        cabinetStatus: [],
        reservationStatus: [],
      },
      charts: {
        cabinetUtilization: [],
        accessFunnel: [],
      },
    },
    operations: {
      kpis: {
        avgSessionMinutes: 0,
        p95SessionMinutes: 0,
      },
      series: {
        sessionDurationByDay: [],
        accessByDay: [],
        usageByHour: [],
      },
    },
    inventory: {
      kpis: {
        totalWithdrawn: 0,
        totalReturned: 0,
        netMovement: 0,
      },
      series: {
        inventoryFlowByDay: [],
      },
      breakdowns: {
        movementByCategory: [],
        topItemsByMovement: [],
      },
    },
    reservations: {
      kpis: {
        active: 0,
        completed: 0,
        cancelled: 0,
      },
      series: {
        registeredByDay: [],
      },
    },
    maintenance: {
      kpis: {
        overdue: 0,
        dueSoon: 0,
        healthy: 0,
      },
      breakdowns: {
        riskDistribution: [],
      },
      series: {
        maintenanceTrendByDay: [],
      },
    },
  },
}

export async function getDashboardAnalytics(
  days = 30,
): Promise<DashboardAnalytics> {
  const supabase = await createClient()
  const safeDays = Math.max(1, Math.min(days, 180))
  const { data, error } = await supabase.rpc("get_admin_dashboard_analytics", {
    p_days: safeDays,
  })

  if (error || !data) {
    console.error("Error fetching dashboard analytics RPC:", error)

    const { data: maintenanceItems } = await supabase
      .from("items_maintenance")
      .select(
        `
        id,
        interval_days,
        created_at,
        maintenance_history(date,created_at)
      `,
      )

    const now = new Date()
    const fallbackRisk = {
      overdue: 0,
      dueSoon: 0,
      healthy: 0,
    }
    let itemsWithHistory = 0

    for (const row of maintenanceItems ?? []) {
      const history = Array.isArray((row as any).maintenance_history)
        ? (row as any).maintenance_history
        : []
      const latest =
        history
          .map((h: any) => h.date ?? h.created_at)
          .filter(Boolean)
          .sort((a: string, b: string) => +new Date(b) - +new Date(a))[0] ??
        null

      if (!latest) continue
      itemsWithHistory += 1
      const baseDate = new Date(latest)
      const nextDate = new Date(baseDate)
      nextDate.setDate(nextDate.getDate() + (row as any).interval_days)
      const daysLeft = Math.ceil(
        (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      )

      if (daysLeft < 0) fallbackRisk.overdue += 1
      else if (daysLeft <= 7) fallbackRisk.dueSoon += 1
      else fallbackRisk.healthy += 1
    }

    return {
      ...EMPTY_ANALYTICS,
      periodDays: safeDays,
      tabs: {
        ...EMPTY_ANALYTICS.tabs,
        maintenance: {
          ...EMPTY_ANALYTICS.tabs.maintenance,
          kpis: fallbackRisk,
          breakdowns: {
            riskDistribution:
              itemsWithHistory > 0
                ? [
                    { status: "overdue", count: fallbackRisk.overdue },
                    { status: "dueSoon", count: fallbackRisk.dueSoon },
                    { status: "healthy", count: fallbackRisk.healthy },
                  ]
                : [],
          },
        },
      },
      summary: {
        ...EMPTY_ANALYTICS.summary,
        overdueMaintenance: fallbackRisk.overdue,
      },
    }
  }

  const analytics = data as DashboardAnalytics
  const {
    count: maintenanceHistoryCount,
    error: maintenanceHistoryCountError,
  } = await supabase
    .from("maintenance_history")
    .select("id", { count: "exact", head: true })

  if (maintenanceHistoryCountError) {
    console.error(
      "Error checking maintenance history count:",
      maintenanceHistoryCountError,
    )
  }

  if ((maintenanceHistoryCount ?? 0) === 0) {
    analytics.tabs.maintenance.breakdowns.riskDistribution = []
  }

  analytics.tabs.maintenance.breakdowns.riskDistribution =
    analytics.tabs.maintenance.breakdowns.riskDistribution.filter(
      (entry) => entry.count > 0,
    )
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - (safeDays - 1))
  startDate.setHours(0, 0, 0, 0)

  const { data: reservationsInPeriod, error: reservationsError } =
    await supabase
      .from("item_reservations")
      .select("created_at,status")
      .gte("created_at", startDate.toISOString())
      .in("status", ["completed", "cancelled"])

  if (reservationsError) {
    console.error(
      "Error fetching reservations registered by day:",
      reservationsError,
    )
    return analytics
  }

  const dayKeys = Array.from({ length: safeDays }, (_, offset) => {
    const day = new Date(startDate)
    day.setDate(startDate.getDate() + offset)
    return day.toISOString().slice(0, 10)
  })

  const dayMap = new Map(
    dayKeys.map((day) => [day, { day, completed: 0, cancelled: 0 }]),
  )

  for (const row of reservationsInPeriod ?? []) {
    const day = row.created_at?.slice(0, 10)
    if (!day || !dayMap.has(day)) continue
    const entry = dayMap.get(day)
    if (!entry) continue

    if (row.status === "completed") entry.completed += 1
    if (row.status === "cancelled") entry.cancelled += 1
  }

  analytics.tabs.reservations.series.registeredByDay = dayKeys.map(
    (day) => dayMap.get(day)!,
  )
  analytics.tabs.reservations.kpis.completed = (
    reservationsInPeriod ?? []
  ).filter((row) => row.status === "completed").length
  analytics.tabs.reservations.kpis.cancelled = (
    reservationsInPeriod ?? []
  ).filter((row) => row.status === "cancelled").length

  return analytics
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const analytics = await getDashboardAnalytics(30)

  return {
    totalCabinets: analytics.summary.totalCabinets,
    totalItems: analytics.summary.totalItems,
    activeSessions: analytics.summary.activeSessions,
    pendingUsers: analytics.summary.pendingUsers,
    lockedCabinets: analytics.summary.lockedCabinets,
  }
}
