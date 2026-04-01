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

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`kpi-skeleton-${index}`}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="mb-2 h-8 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`chart-skeleton-${index}`}
            className="rounded-xl border bg-card shadow-sm"
          >
            <div className="space-y-2 border-b p-4">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="p-4">
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 space-y-3 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <Skeleton className="h-[240px] w-full rounded-lg" />
      </section>
    </main>
  )
}
