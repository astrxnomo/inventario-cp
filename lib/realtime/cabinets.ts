import { createClient } from "@/lib/supabase/client"
import type { CabinetRow, InventoryItemRow } from "@/lib/types/cabinets"

/**
 * Payload shape emitted by the `realtime.broadcast_changes` DB trigger function.
 * Note: uses `record`/`old_record` keys (NOT `new`/`old` like postgres_changes).
 */
interface BroadcastChangePayload {
  schema: string
  table: string
  commit_timestamp: string
  type: string
  record: Record<string, unknown> | null
  old_record: Record<string, unknown> | null
  errors: string[] | null
}

// ─── Grid-level realtime ───────────────────────────────────────────────────────

export interface CabinetsGridCallbacks {
  onCabinetInsert: (row: CabinetRow) => void
  onCabinetUpdate: (id: string, changes: Partial<CabinetRow>) => void
  onCabinetDelete: (id: string) => void
  /** Cabinet session opened (+1) or closed (-1) — update that cabinet's count inline */
  onSessionChanged: (
    cabinetId: string,
    delta: 1 | -1,
    isCurrentUserSession: boolean,
  ) => void
  onInventoryInsert: (cabinetId: string, itemName: string) => void
  onInventoryDelete: (cabinetId: string, itemName: string) => void
  onConnected: (connected: boolean) => void
}

/**
 * Subscribe to all changes needed to keep the cabinet grid in sync.
 * Uses Broadcast via DB triggers (not postgres_changes) for better scalability.
 *
 * Topic: 'cabinets:grid'  (private channel — requires RLS on realtime.messages)
 * Returns an unsubscribe function — call it inside `useEffect` cleanup.
 */
export function subscribeCabinetsGrid(
  currentUserId: string,
  callbacks: CabinetsGridCallbacks,
): () => void {
  const supabase = createClient()

  const channel = supabase
    .channel("cabinets:grid", { config: { private: true } })
    .on(
      "broadcast",
      { event: "INSERT" },
      ({ payload }: { payload: BroadcastChangePayload }) => {
        if (payload.table === "cabinets") {
          callbacks.onCabinetInsert(payload.record as unknown as CabinetRow)
        } else if (payload.table === "inventory_items") {
          const row = payload.record as unknown as Pick<
            InventoryItemRow,
            "cabinet_id" | "name"
          >
          callbacks.onInventoryInsert(row.cabinet_id, row.name)
        } else if (payload.table === "cabinet_sessions") {
          const row = payload.record as { cabinet_id: string; user_id: string }
          callbacks.onSessionChanged(
            row.cabinet_id,
            1,
            row.user_id === currentUserId,
          )
        }
      },
    )
    .on(
      "broadcast",
      { event: "UPDATE" },
      ({ payload }: { payload: BroadcastChangePayload }) => {
        if (payload.table === "cabinets") {
          const row = payload.record as unknown as CabinetRow
          callbacks.onCabinetUpdate(row.id, row)
        } else if (payload.table === "cabinet_sessions") {
          const row = payload.record as {
            cabinet_id: string
            user_id: string
            closed_at: string | null
          }
          // Only decrement when a session transitions from open to closed.
          if (row.closed_at) {
            callbacks.onSessionChanged(
              row.cabinet_id,
              -1,
              row.user_id === currentUserId,
            )
          }
        }
      },
    )
    .on(
      "broadcast",
      { event: "DELETE" },
      ({ payload }: { payload: BroadcastChangePayload }) => {
        if (payload.table === "cabinets") {
          callbacks.onCabinetDelete((payload.old_record as { id: string }).id)
        } else if (payload.table === "inventory_items") {
          // cabinet_id and name are available from the trigger's OLD record (no replica identity needed)
          const old = payload.old_record as Partial<InventoryItemRow>
          if (old.cabinet_id)
            callbacks.onInventoryDelete(old.cabinet_id, old.name ?? "")
        } else if (payload.table === "cabinet_sessions") {
          const oldRow = payload.old_record as {
            cabinet_id: string
            user_id: string
          }
          callbacks.onSessionChanged(
            oldRow.cabinet_id,
            -1,
            oldRow.user_id === currentUserId,
          )
        }
      },
    )
    .subscribe((status) => callbacks.onConnected(status === "SUBSCRIBED"))

  return () => {
    supabase.removeChannel(channel)
  }
}
