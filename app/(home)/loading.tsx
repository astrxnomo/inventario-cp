import { AppNav } from "@/components/layout/app-nav"
import { Skeleton } from "@/components/ui/skeleton"

export default function CabinetsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main id="main-content" className="lg:pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto w-full max-w-xl pb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent blur-sm" />
              <div className="relative rounded-2xl border border-border/70 bg-card/80 p-1 backdrop-blur">
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
            <Skeleton className="mt-2 h-4 w-44" />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/70 bg-card/65 p-3 shadow-sm"
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-2 h-3 w-24" />
                <Skeleton className="mt-4 h-8 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
