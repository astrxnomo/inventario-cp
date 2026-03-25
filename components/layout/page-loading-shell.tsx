import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface PageLoadingShellProps {
  children: React.ReactNode
  className?: string
  navActions?: 2 | 3
}

export function PageLoadingShell({
  children,
  className,
  navActions = 2,
}: PageLoadingShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-primary/8 to-transparent" />

      <div className="relative px-3 pt-4 pb-2 sm:px-5 sm:pt-5">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-2xl border border-border/80 bg-card/85 px-4 shadow-md ring-1 shadow-black/5 ring-border/50 backdrop-blur-md sm:px-5">
          <Skeleton className="h-7 w-44" />
          <div className="flex items-center gap-2">
            {navActions === 3 && <Skeleton className="h-9 w-20 rounded-xl" />}
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
        </div>
      </div>

      <main className={cn("relative", className)}>{children}</main>
    </div>
  )
}
