import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative animate-pulse overflow-hidden rounded-md border border-border/40 bg-muted/70",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
