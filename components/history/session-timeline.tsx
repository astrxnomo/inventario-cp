"use client"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { HistorySession } from "@/lib/types/cabinets"
import { formatDate } from "@/lib/utils"
import { Archive, ArrowDown, ArrowUp, Clock, Package } from "lucide-react"

interface SessionTimelineProps {
  session: HistorySession | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SessionTimeline({
  session,
  open,
  onOpenChange,
}: SessionTimelineProps) {
  if (!session) return null

  const openedAt = new Date(session.opened_at)
  const closedAt = session.closed_at ? new Date(session.closed_at) : null
  const items = session.items || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            Timeline de sesion
          </DialogTitle>
          <DialogDescription>
            Actividad en {session.cabinet_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-1">
          <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/20">
              <Archive className="size-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-primary">Sesion iniciada</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(openedAt, "d MMM, h:mm a")}
              </p>
            </div>
          </div>

          {items.map((item, index) => {
            const isWithdrawn = item.action === "withdrawn"
            const itemDate = new Date(item.added_at)

            return (
              <div
                key={
                  item.id ||
                  `${session.id}-${item.name}-${item.action}-${index}`
                }
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

          {closedAt ? (
            <div className="flex items-center gap-3 border-l-4 border-secondary pl-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-secondary/50">
                <Package className="size-4 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-secondary-foreground">
                  Sesion cerrada
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(closedAt, "d MMM, h:mm a")}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l-4 border-dashed border-muted pl-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                <Clock className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-muted-foreground">En curso</p>
                <p className="text-sm text-muted-foreground">Sesion activa</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
