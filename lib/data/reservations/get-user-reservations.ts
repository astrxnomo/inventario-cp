import { createClient } from "@/lib/supabase/server"

import type { ItemReservation } from "@/lib/types/reservations"

type ReservationJoinRow = {
  id: string
  cabinet_id: string
  item_id: string
  user_id: string
  quantity: number
  starts_at: string
  ends_at: string
  status: "active" | "cancelled" | "completed" | "expired"
  note: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  cabinets: { name: string } | null
  profiles: { full_name: string | null } | null
  inventory_items:
    | { name: string; inventory_categories: { name: string } | null }
    | { name: string; inventory_categories: { name: string } | null }[]
    | null
}

const SELECT_FIELDS = [
  "id",
  "cabinet_id",
  "item_id",
  "user_id",
  "quantity",
  "starts_at",
  "ends_at",
  "status",
  "note",
  "cancelled_at",
  "created_at",
  "updated_at",
  "cabinets(name)",
  "profiles!fk_user_id(full_name)",
  "inventory_items(name, inventory_categories(name))",
].join(", ")

function mapReservation(
  row: ReservationJoinRow,
  currentUserId: string,
): ItemReservation {
  const rawItem = Array.isArray(row.inventory_items)
    ? row.inventory_items[0]
    : row.inventory_items

  return {
    id: row.id,
    cabinet_id: row.cabinet_id,
    item_id: row.item_id,
    user_id: row.user_id,
    quantity: row.quantity,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    status: row.status,
    note: row.note,
    cancelled_at: row.cancelled_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    item_name: rawItem?.name ?? "Artículo desconocido",
    item_category: rawItem?.inventory_categories?.name ?? "Sin categoría",
    cabinet_name: row.cabinets?.name ?? "Gabinete desconocido",
    user_name: row.profiles?.full_name ?? "Usuario desconocido",
    can_cancel: row.status === "active" && row.user_id === currentUserId,
  }
}

export async function getUserReservations(
  userId: string,
): Promise<ItemReservation[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("item_reservations")
    .select(SELECT_FIELDS)
    .eq("user_id", userId)
    .order("starts_at", { ascending: false })

  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as ReservationJoinRow[]).map((row) =>
    mapReservation(row, userId),
  )
}

export async function getAllReservations(
  currentUserId: string,
): Promise<ItemReservation[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("item_reservations")
    .select(SELECT_FIELDS)
    .order("starts_at", { ascending: false })
    .limit(500)

  if (error) throw new Error(error.message)

  return ((data ?? []) as unknown as ReservationJoinRow[]).map((row) => ({
    ...mapReservation(row, currentUserId),
    can_cancel: row.status === "active",
  }))
}
