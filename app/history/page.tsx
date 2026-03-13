import { AppNav } from "@/components/layout/app-nav"
import { SessionHistory } from "@/components/history/session-history"
import { RefreshButton } from "@/components/ui/refresh-button"
import { getUserSessionHistory } from "@/lib/data/cabinets/get-user-history"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role === "pending") redirect("/cabinets")

  const sessions = await getUserSessionHistory(supabase, user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav
        userEmail={user.email}
        userRole={profile.role}
        userName={profile.full_name}
      />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Mi historial
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {sessions.length === 0
                ? "Sin sesiones registradas"
                : `${sessions.length} sesión${sessions.length !== 1 ? "es" : ""} registrada${sessions.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <RefreshButton />
        </div>

        <SessionHistory sessions={sessions} />
      </main>
    </div>
  )
}
