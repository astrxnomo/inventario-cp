// ─── Log entries ──────────────────────────────────────────────────────────────
export interface AccessLog {
  id: string
  user_id: string
  cabinet_id: string
  action: "open_requested" | "open_granted" | "open_denied" | "closed"
  created_at: string
  metadata: Record<string, any> | null
  user_name?: string
  user_email?: string
  cabinet_name?: string
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
