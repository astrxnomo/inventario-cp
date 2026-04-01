import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-24 self-start rounded-xl sm:self-auto" />
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`kpi-skeleton-${index}`}
            className="rounded-xl border border-border/80 bg-card p-4 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="mb-3 h-9 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </section>

      <section className="mt-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`chart-skeleton-${index}`}
              className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm"
            >
              <div className="space-y-2 border-b p-4">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-64 max-w-[85%]" />
              </div>
              <div className="p-4">
                <Skeleton className="h-[280px] w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`summary-skeleton-${index}`}
            className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm"
          >
            <div className="space-y-2 border-b p-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48 max-w-[80%]" />
            </div>
            <div className="p-4">
              <Skeleton className="h-[180px] w-full rounded-lg" />
            </div>
          </div>
        ))}
      </section>
    </main>
  )
}
