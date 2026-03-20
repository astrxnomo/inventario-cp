import { Skeleton } from "@/components/ui/skeleton"

export default function AdminReservationsLoading() {
  return (
    <main className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-24 self-start sm:self-auto" />
      </div>
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Skeleton className="h-9 w-full sm:w-64" />
          <Skeleton className="h-9 w-full sm:w-36" />
        </div>
        <Skeleton className="h-8 w-48 sm:w-80" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </main>
  )
}
