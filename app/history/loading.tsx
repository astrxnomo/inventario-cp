import { Skeleton } from "@/components/ui/skeleton"

export default function HistoryLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </main>
    </div>
  )
}
