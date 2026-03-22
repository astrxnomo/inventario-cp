import { SessionsTable } from "@/components/admin/sessions/table"
import { getAllSessions } from "@/lib/data/sessions/get-all-sessions"

export default async function AdminSessionsPage() {
  const sessions = await getAllSessions()

  const activeSessions = sessions.filter((s) => !s.closed_at).length

  return (
    <main id="main-content" className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sesiones
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sessions.length} sesión{sessions.length !== 1 ? "es" : ""}{" "}
            registrada{sessions.length !== 1 ? "s" : ""}
            {activeSessions > 0 && (
              <span className="ml-2 font-medium text-green-600">
                · {activeSessions} activa{activeSessions !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
      </div>

      <SessionsTable sessions={sessions} />
    </main>
  )
}
