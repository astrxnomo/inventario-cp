import { AppNav } from "@/components/layout/app-nav"
import { DataTableSkeleton } from "@/components/tables/data-table-skeleton"

import { Skeleton } from "@/components/ui/skeleton"

export default function HistoryLoading() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-9 w-24 self-start rounded-xl sm:self-auto" />
        </div>
        <DataTableSkeleton rowCount={10} columnCount={5} />
      </main>
    </div>
  )
}
