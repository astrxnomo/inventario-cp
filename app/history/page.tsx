import { MyReservations } from "@/components/history/my-reservations"
import { SessionHistory } from "@/components/history/session-history"
import { AppNav } from "@/components/layout/app-nav"
import { RefreshButton } from "@/components/ui/refresh-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserSessionHistory } from "@/lib/data/cabinets/get-user-history"
import { getUserReservations } from "@/lib/data/reservations/get-reservations"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HistoryPage() {
  const current = await getCurrentUser()
  if (!current) redirect("/login")

  const { user, profile } = current

  if (!profile || profile.role === "pending") redirect("/cabinets")

  const supabase = await createClient()
  const [sessions, reservations] = await Promise.all([
    getUserSessionHistory(supabase, user.id),
    getUserReservations(supabase, user.id),
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
          </div>
          <RefreshButton />
        </div>

        <Tabs defaultValue="sessions">
          <TabsList className="mb-4">
            <TabsTrigger value="sessions">
              Sesiones ({sessions.length})
            </TabsTrigger>
            <TabsTrigger value="reservations">
              Reservas ({reservations.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sessions">
            <SessionHistory sessions={sessions} />
          </TabsContent>
          <TabsContent value="reservations">
            <MyReservations reservations={reservations} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
