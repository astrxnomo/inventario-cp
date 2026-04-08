"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  returnCabinetItems,
  returnSingleItem,
} from "@/lib/actions/cabinets/return"
import { formatDate } from "@/lib/utils"
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Clock,
  Loader2,
  Package,
  RotateCcw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import type { AdminSession } from "./columns"
import { Badge } from "@/components/ui/badge"

interface SessionTimelineProps {
  session: AdminSession | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SessionTimeline({
  session,
  open,
  onOpenChange,
}: SessionTimelineProps) {
  const router = useRouter()
  const [isReturningAll, startReturningAll] = useTransition()
  const [returningItemId, setReturningItemId] = useState<string | null>(null)
  const items = useMemo(() => session?.items ?? [], [session?.items])
  const isActive = !session?.closed_at

  const pendingItems = useMemo(() => {
    const balance = new Map<
      string,
      { itemId: string; name: string; quantity: number }
    >()

    for (const item of items) {
      const key = item.item_id
      const prev = balance.get(key) ?? {
        itemId: key,
        name: item.name,
        quantity: 0,
      }

      const delta = item.action === "withdrawn" ? item.quantity : -item.quantity
      balance.set(key, { ...prev, quantity: prev.quantity + delta })
    }

    return Array.from(balance.values())
      .filter((it) => it.quantity > 0)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [items])

  if (!session) return null

  const openedAt = new Date(session.opened_at)
  const closedAt = session.closed_at ? new Date(session.closed_at) : null

  const handleReturnAll = () => {
    if (!isActive || pendingItems.length === 0) return

    startReturningAll(async () => {
      const result = await returnCabinetItems({
        sessionId: session.id,
        userId: session.user_id,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Items devueltos y sesión cerrada")
      onOpenChange(false)
      router.refresh()
    })
  }

  const handleReturnSingle = async (itemId: string) => {
    if (!isActive) return

    setReturningItemId(itemId)
    const result = await returnSingleItem({
      sessionId: session.id,
      userId: session.user_id,
      itemId,
    })
    setReturningItemId(null)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success("Item devuelto")
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Linea de tiempo - {session.user_name}
          </DialogTitle>
          <DialogDescription>
            Actividad en {session.cabinet_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-1">
          {isActive && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-50/60 p-3 dark:bg-amber-950/20">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                Gestion de sesion activa
              </p>
              <p className="mt-0.5 text-xs text-amber-700/80 dark:text-amber-300/80">
                Puedes devolver items puntuales o devolver todo para cerrar la
                sesion.
              </p>

              {pendingItems.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  No hay items pendientes por devolver.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {pendingItems.map((item) => (
                    <div
                      key={item.itemId}
                      className="flex items-center justify-between gap-2 rounded-md border bg-background/70 px-2.5 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pendiente: {item.quantity}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleReturnSingle(item.itemId)}
                        disabled={
                          isReturningAll || returningItemId === item.itemId
                        }
                        className="shrink-0"
                      >
                        {returningItemId === item.itemId ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Devolviendo...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="size-4" />
                            Devolver
                          </>
                        )}
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    className="mt-1 w-full"
                    onClick={handleReturnAll}
                    disabled={isReturningAll || returningItemId !== null}
                  >
                    {isReturningAll ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Devolviendo todo...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="size-4" />
                        Devolver todo y terminar sesión
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Apertura */}
          <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/20">
              <Archive className="size-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-primary">Sesión iniciada</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(openedAt, "d MMM, h:mm a")}
              </p>
            </div>
          </div>

          {/* Items */}
          {items.map((item) => {
            const itemDate = new Date(item.added_at)
            const isWithdrawn = item.action === "withdrawn"

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 border-l-4 pl-4 ${
                  isWithdrawn ? "border-destructive" : "border-accent"
                }`}
              >
                <div
                  className={`flex size-8 items-center justify-center rounded-full ${
                    isWithdrawn ? "bg-destructive/10" : "bg-accent/50"
                  }`}
                >
                  {isWithdrawn ? (
                    <ArrowDown className="size-4 text-destructive" />
                  ) : (
                    <ArrowUp className="size-4 text-accent-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      isWithdrawn
                        ? "text-destructive"
                        : "text-accent-foreground"
                    }`}
                  >
                    {isWithdrawn ? "Retirado" : "Devuelto"}
                  </p>

                  <p className="text-sm font-medium">
                    {item.name}{" "}
                    <Badge variant="outline" className="text-xs">
                      x{item.quantity}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(itemDate, "d MMM, h:mm a")}
                  </p>
                </div>
              </div>
            )
          })}

          {/* Cierre */}
          {closedAt ? (
            <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/20">
                <Package className="size-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-primary">Sesión cerrada</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(closedAt, "d MMM, h:mm a")}
                </p>
                {session.notes && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    &quot;{session.notes}&quot;
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l-4 border-dashed border-muted pl-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                <Clock className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-muted-foreground">En curso</p>
                <p className="text-sm text-muted-foreground">Sesión activa</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
