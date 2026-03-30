import { ReservationTable } from "@/components/history/reservation-table"
import { SessionHistoryTable } from "@/components/history/session-history-table"
import { AppNav } from "@/components/layout/app-nav"
import { RefreshButton } from "@/components/ui/refresh-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserReservations } from "@/lib/data/reservations/get-user-reservations"
import { getUserSessionHistory } from "@/lib/data/sessions/get-user-history"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { redirect } from "next/navigation"

export default async function HistoryPage() {
  const current = await getCurrentUser()
  if (!current) redirect("/auth")

  const { user, profile } = current

  if (!profile || profile.role === "pending") redirect("/")

  const [sessions, reservations] = await Promise.all([
    getUserSessionHistory(user.id),
    getUserReservations(user.id),
  ])

  return (
    <div className="min-h-screen bg-background">
      <AppNav
        userEmail={user.email}
        userRole={profile.role}
        userName={profile.full_name}
      />

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Mi historial
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Consulta tus sesiones de gabinete y reservas de items
            </p>
          </div>
          <RefreshButton />
        </div>

        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="sessions">
              Sesiones ({sessions.length})
            </TabsTrigger>
            <TabsTrigger value="reservations">
              Reservas ({reservations.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sessions" className="mt-0">
            <SessionHistoryTable sessions={sessions} />
          </TabsContent>
          <TabsContent value="reservations" className="mt-0">
            <ReservationTable reservations={reservations} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
