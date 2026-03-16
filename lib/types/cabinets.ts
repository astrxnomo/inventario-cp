import type { Database, Tables } from "@/lib/supabase/types"

// ─── Base DB row types ─────────────────────────────────────────────────────────
export type CabinetRow = Tables<"cabinets">
export type InventoryItemRow = Tables<"inventory_items">
export type CabinetSessionRow = Tables<"cabinet_sessions">
export type CabinetStatus = Database["public"]["Enums"]["cabinet_status"]

// ─── Domain read model: cabinet enriched with computed counts ──────────────────
export type Cabinet = CabinetRow & {
  _count: {
    inventory_items: number
    active_sessions: number
  }
  item_names: string[]
}

// Enriched with computed in-use count (items currently checked out across open sessions)
export type InventoryItem = InventoryItemRow & {
  category: string
  in_use: number
  reserved_by_me: number
  reserved_by_others: number
}

// ─── Detail drawer state machine ──────────────────────────────────────────────
export type Mode = "loading" | "browse" | "returning"
/** key: item_id → quantity the current user wants to withdraw */
export type Selections = Record<string, number>

export interface WithdrawnItem {
  session_item_id: string
  item_id: string
  name: string
  category: string
  quantity: number
}

// ─── Action payloads ──────────────────────────────────────────────────────────
export interface WithdrawPayload {
  cabinetId: string
  userId: string
  items: Array<{ item_id: string; quantity: number }>
}

export interface ReturnPayload {
  sessionId: string
  userId: string
}

export interface ReturnSingleItemPayload {
  sessionId: string
  userId: string
  itemId: string
}

// ─── Generic typed action result ──────────────────────────────────────────────
export type ActionResult<T> =
  | { data: T; error: null }
  | { data: null; error: string }

// ─── User session history ─────────────────────────────────────────────────────
export interface HistorySessionItem {
  name: string
  quantity: number
  action: "withdrawn" | "returned"
}

export interface HistorySession {
  id: string
  cabinet_name: string
  opened_at: string
  closed_at: string | null
  notes: string | null
  items: HistorySessionItem[]
}

// ─── Cabinet management (admin) ───────────────────────────────────────────────
export interface CabinetAdmin {
  id: string
  name: string
  description: string | null
  location: string | null
  status: "available" | "in_use" | "locked"
  is_open: boolean
  item_count: number
  created_at: string
}

export interface CabinetItemAdmin {
  id: string
  name: string
  quantity: number
  category_id: string
  category_name: string
}
