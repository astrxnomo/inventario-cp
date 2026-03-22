import { ActivityLogsTable } from "@/components/admin/activity/table"
import { getAccessLogs } from "@/lib/data/activity/get-access-logs"

export default async function AdminActivityPage() {
  const logs = await getAccessLogs()

  return (
    <main id="main-content" className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Actividad
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {logs.length} registro{logs.length !== 1 ? "s" : ""} de acceso a
            gabinetes
          </p>
        </div>
      </div>

      <ActivityLogsTable logs={logs} />
    </main>
  )
}
