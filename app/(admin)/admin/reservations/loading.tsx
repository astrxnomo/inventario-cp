import { Skeleton } from "@/components/ui/skeleton"

export default function AdminReservationsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-64" />
        </div>
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </main>
  )
}
