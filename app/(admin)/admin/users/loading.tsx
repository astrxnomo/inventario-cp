import { Skeleton } from "@/components/ui/skeleton"

export default function UsersLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-20" />
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </main>
  )
}
