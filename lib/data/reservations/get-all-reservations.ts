import { createClient } from "@/lib/supabase/server"

export type AdminReservation = {
  id: string
  user_id: string
  item_id: string
  cabinet_id: string
  quantity: number
  starts_at: string
  ends_at: string
  status: "active" | "completed" | "cancelled" | "expired"
  notes: string | null
  user_name?: string
  item_name?: string
  cabinet_name?: string
  category_name?: string
}

export async function getAllReservations(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<AdminReservation[]> {
  const { data, error } = await supabase
    .from("item_reservations")
    .select(
      `
      id,
      user_id,
      item_id,
      cabinet_id,
      quantity,
      starts_at,
      ends_at,
      status,
      notes,
      profiles!inner(full_name),
      inventory_items!inner(name, category_id),
      cabinets!inner(name),
      inventory_categories(name)
    `,
    )
    .order("starts_at", { ascending: false })
    .limit(200)

  if (error) {
    console.error("Error fetching reservations:", error)
    return []
  }

  return (data ?? []).map((reservation) => ({
    id: reservation.id,
    user_id: reservation.user_id,
    item_id: reservation.item_id,
    cabinet_id: reservation.cabinet_id,
    quantity: reservation.quantity,
    starts_at: reservation.starts_at,
    ends_at: reservation.ends_at,
    status: reservation.status as AdminReservation["status"],
    notes: reservation.notes,
    user_name: (reservation.profiles as any)?.full_name ?? "Sin nombre",
    item_name: (reservation.inventory_items as any)?.name ?? "Sin item",
    cabinet_name: (reservation.cabinets as any)?.name ?? "Sin gabinete",
    category_name: (reservation.inventory_categories as any)?.name ?? null,
  }))
}
