import {
  itemReservationRowSchema,
  type GroupReservationInput,
  type ReservationAvailabilityInput,
  type ReservationInput,
} from "@/lib/schemas/reservations"
import type { Enums } from "@/lib/supabase/types"
import { z } from "zod"

export type ReservationStatus = Enums<"reservation_status">
export type ItemReservationRow = z.infer<typeof itemReservationRowSchema>

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

export type CreateReservationPayload = ReservationInput
export type CreateGroupReservationPayload = GroupReservationInput
export type ReservationAvailabilityPayload = ReservationAvailabilityInput
