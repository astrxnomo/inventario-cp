"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

interface RefreshButtonProps {
  label?: string
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function RefreshButton({
  label = "Actualizar",
  variant = "outline",
  size = "sm",
  className,
}: RefreshButtonProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant={variant}
      size={size}
      disabled={pending}
      onClick={() => startTransition(() => router.refresh())}
      className={cn("h-8", className)}
    >
      <RefreshCw className={cn("size-4", pending && "animate-spin")} />
      {label}
    </Button>
  )
}
