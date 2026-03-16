import type { Enums, Tables } from "@/lib/supabase/types"

export type ReservationStatus = Enums<"reservation_status">
export type ItemReservationRow = Tables<"item_reservations">
export type ReservationGroupRow = Tables<"reservation_groups">

export interface ItemReservation extends ItemReservationRow {
  item_name: string
  item_category: string
  cabinet_name: string
  user_name: string
  can_cancel: boolean
}

export interface CartItem {
  itemId: string
  itemName: string
  quantity: number
  maxAvailable: number
}

export interface CreateReservationPayload {
  itemId: string
  quantity: number
  startsAt: string
  endsAt: string
  note?: string
}

export interface CreateGroupReservationPayload {
  items: Array<{ itemId: string; quantity: number }>
  startsAt: string
  endsAt: string
  note?: string
}

export interface ReservationAvailabilityPayload {
  itemId: string
  startsAt: string
  endsAt: string
}
