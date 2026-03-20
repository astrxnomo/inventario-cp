import { Skeleton } from "@/components/ui/skeleton"

export default function CabinetsAdminLoading() {
  return (
    <main className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </main>
  )
}
