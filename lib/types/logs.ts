// ─── Log entries ──────────────────────────────────────────────────────────────
export interface AccessLogEntry {
  id: string
  created_at: string
  action: string
  cabinet_name: string | null
  cabinet_id: string
  user_name: string | null
}

// ─── Unified session view (session + embedded items) ──────────────────────────
export interface SessionItemSummary {
  id: string
  created_at: string
  action: string
  quantity: number
  item_name: string | null
}

export interface SessionWithItems {
  id: string
  opened_at: string
  closed_at: string | null
  cabinet_name: string | null
  cabinet_id: string
  user_name: string | null
  items: SessionItemSummary[]
}
