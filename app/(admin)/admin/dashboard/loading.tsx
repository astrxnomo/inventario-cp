import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    </main>
  )
}
