export type MaintenanceItem = {
  id: string
  item_id: string
  interval_days: number
  created_at: string
  item_name: string
  cabinet_name?: string | null
  last_maintenance_at: string | null
  next_maintenance_at: string
  days_until_next_maintenance: number
  maintenance_status: "overdue" | "due_soon" | "healthy"
}

export type MaintenanceHistoryEntry = {
  id: string
  maintenance_id: string
  created_at: string
  date: string
  item_id: string
  item_name: string
  cabinet_name?: string | null
  interval_days: number
  registered_by?: string | null
  registered_by_name?: string | null
}
