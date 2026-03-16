import { ReservationsTable } from "@/components/admin/reservations-table"
import { RefreshButton } from "@/components/ui/refresh-button"
import { getAllReservations } from "@/lib/data/reservations/get-reservations"
import { createClient } from "@/lib/supabase/server"

export default async function AdminReservationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const reservations = await getAllReservations(supabase, user?.id ?? "")

  const counts = {
    total: reservations.length,
    active: reservations.filter((r) => r.status === "active").length,
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Reservas
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {counts.total} total · {counts.active} activa
            {counts.active !== 1 ? "s" : ""}
          </p>
        </div>
        <RefreshButton />
      </div>

      <ReservationsTable reservations={reservations} />
    </main>
  )
}
