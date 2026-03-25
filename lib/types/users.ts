import { userProfileSchema } from "@/lib/schemas/users"
import { z } from "zod"

export type Profile = z.infer<typeof userProfileSchema>

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────
export interface DashboardKpis {
  totalCabinets: number
  totalItems: number
  activeSessions: number
  pendingUsers: number
  lockedCabinets: number
}
