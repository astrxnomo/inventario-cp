import { Button } from "@/components/ui/button"
import type { WithdrawnItem } from "@/lib/types/cabinets"
import { CheckCircle2, Loader2, Minus, RotateCcw } from "lucide-react"
import { useState } from "react"

interface ReturnListProps {
  withdrawnItems: WithdrawnItem[]
  onReturnItem?: (itemId: string, quantity: number) => void
  returningItemId?: string | null
  canConfirmReturn?: boolean
}

export function ReturnList({
  withdrawnItems,
  onReturnItem,
  returningItemId,
  canConfirmReturn = true,
}: ReturnListProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  function setQty(itemId: string, nextQty: number, maxQty: number) {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.min(Math.max(nextQty, 1), maxQty),
    }))
  }

  if (withdrawnItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CheckCircle2 className="mb-2 h-8 w-8 text-primary/20" />
        <p className="text-sm text-muted-foreground">
          No hay artículos pendientes
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        className={
          canConfirmReturn
            ? "rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success-foreground"
            : "rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground"
        }
      >
        {canConfirmReturn
          ? "Gabinete abierto. Ya puedes confirmar las devoluciones."
          : "Abre el gabinete para habilitar la confirmación de devoluciones."}
      </div>

      <ul className="space-y-2">
        {withdrawnItems.map((item) => {
          const isReturning = returningItemId === item.item_id
          const selectedQty = Math.min(
            Math.max(quantities[item.item_id] ?? item.quantity, 1),
            item.quantity,
          )
          return (
            <li
              key={item.item_id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm wrap-break-word whitespace-normal text-foreground">
                  {item.name}
                </p>
                <span className="mt-0.5 inline-block rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-foreground tabular-nums">
                  {item.quantity}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  retirado{item.quantity !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1 rounded-md border border-border bg-muted/40 p-1">
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    disabled={
                      isReturning || !!returningItemId || selectedQty <= 1
                    }
                    onClick={() =>
                      setQty(item.item_id, selectedQty - 1, item.quantity)
                    }
                  >
                    <Minus />
                  </Button>
                  <span className="min-w-7 text-center text-sm font-semibold text-foreground tabular-nums">
                    {selectedQty}
                  </span>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    disabled={
                      isReturning ||
                      !!returningItemId ||
                      selectedQty >= item.quantity
                    }
                    onClick={() =>
                      setQty(item.item_id, selectedQty + 1, item.quantity)
                    }
                  >
                    <span className="text-xs font-semibold">+</span>
                  </Button>
                </div>
                {onReturnItem && (
                  <Button
                    size="lg"
                    variant="outline"
                    disabled={
                      isReturning || !!returningItemId || !canConfirmReturn
                    }
                    onClick={() => onReturnItem(item.item_id, selectedQty)}
                    className="h-7 gap-1 border-border px-2 text-sm font-medium text-foreground hover:bg-muted hover:text-foreground disabled:border-border disabled:text-muted-foreground"
                  >
                    {isReturning ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}
                    Devolver
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
