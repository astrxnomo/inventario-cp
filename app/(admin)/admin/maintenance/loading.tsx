import { Skeleton } from "@/components/ui/skeleton"
import { DataTableSkeleton } from "@/components/tables"

export default function UsersLoading() {
  return (
    <main className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-44" />
        </div>
        <Skeleton className="h-9 w-24 self-start rounded-xl sm:self-auto" />
      </div>
      <DataTableSkeleton rowCount={10} columnCount={5} />
    </main>
  )
}
