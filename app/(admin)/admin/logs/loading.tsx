import { Skeleton } from "@/components/ui/skeleton"

export default function LogsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </main>
  )
}
