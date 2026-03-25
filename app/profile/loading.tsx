import { PageLoadingShell } from "@/components/layout/page-loading-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function HistoryLoading() {
  return (
    <PageLoadingShell className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
        <div className="rounded-xl border border-border/70 bg-card/70 p-3 sm:p-4">
          <div className="mb-3 flex gap-2">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-36 rounded-xl" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    </PageLoadingShell>
  )
}
