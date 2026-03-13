// ─── Admin user list ─────────────────────────────────────────────────────────
export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────
export interface DashboardKpis {
  totalCabinets: number
  totalItems: number
  activeSessions: number
  pendingUsers: number
  lockedCabinets: number
}
