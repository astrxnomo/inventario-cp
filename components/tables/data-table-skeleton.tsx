import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface DataTableSkeletonProps {
  rowCount?: number
  columnCount?: number
  showToolbar?: boolean
  className?: string
}

export function DataTableSkeleton({
  rowCount = 6,
  columnCount = 4,
  showToolbar = true,
  className,
}: DataTableSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card/70 p-3 sm:p-4",
        className,
      )}
    >
      {showToolbar && (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:max-w-xl sm:flex-row">
            <Skeleton className="h-9 w-full rounded-xl sm:w-64" />
            <Skeleton className="h-9 w-full rounded-xl sm:w-36" />
          </div>
          <Skeleton className="h-9 w-full rounded-xl sm:w-28" />
        </div>
      )}

      <div className="space-y-2">
        <div
          className="hidden gap-2 rounded-lg border border-border/60 bg-background/60 p-2 sm:grid"
          style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columnCount }).map((_, i) => (
            <Skeleton key={`head-${i}`} className="h-5 rounded-md" />
          ))}
        </div>

        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="rounded-lg border border-border/60 bg-background/50 p-3"
          >
            <div
              className="hidden gap-2 sm:grid"
              style={{
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <Skeleton
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    "h-5 rounded-md",
                    colIndex === 0 && "w-5/6",
                    colIndex === columnCount - 1 && "w-2/3",
                  )}
                />
              ))}
            </div>

            <div className="space-y-2 sm:hidden">
              <Skeleton className="h-5 w-2/3 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}