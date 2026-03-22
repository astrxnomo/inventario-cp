import { ReservationsTable } from "@/components/admin/reservations-table"
import { RefreshButton } from "@/components/ui/refresh-button"
import { getAllReservations } from "@/lib/data/reservations/get-all-reservations"
import { createClient } from "@/lib/supabase/server"

export default async function AdminReservationsPage() {
  const supabase = await createClient()
  const reservations = await getAllReservations(supabase)

  const counts = {
    total: reservations.length,
    active: reservations.filter((r) => r.status === "active").length,
  }

  return (
    <main id="main-content" className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Reservas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {counts.total} reserva{counts.total !== 1 ? "s" : ""} registrada
            {counts.total !== 1 ? "s" : ""}
            {counts.active > 0 && (
              <span className="ml-2 font-medium text-green-600">
                · {counts.active} activa{counts.active !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <RefreshButton />
      </div>

      <ReservationsTable reservations={reservations} />
    </main>
  )
}
