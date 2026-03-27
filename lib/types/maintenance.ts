export type MaintenanceItem = {
  id: string
  item_id: string
  interval_days: number
  created_at: string
  item_name: string
  cabinet_name?: string | null
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
}
