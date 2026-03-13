import { Skeleton } from "@/components/ui/skeleton"

export default function CabinetsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-40 border-b border-gray-100 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <main className="pb-8">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-5 sm:px-6">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Skeleton className="mb-4 h-9 w-64" />
          <div className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-none" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
