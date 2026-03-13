import { Button } from "@/components/ui/button"
import type { WithdrawnItem } from "@/lib/types/cabinets"
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react"

interface ReturnListProps {
  withdrawnItems: WithdrawnItem[]
  onReturnItem?: (itemId: string) => void
  returningItemId?: string | null
}

export function ReturnList({
  withdrawnItems,
  onReturnItem,
  returningItemId,
}: ReturnListProps) {
  if (withdrawnItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CheckCircle2 className="mb-2 h-8 w-8 text-primary/20" />
        <p className="text-sm text-gray-400">No hay artículos pendientes</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {withdrawnItems.map((item) => {
        const isReturning = returningItemId === item.item_id
        return (
          <li
            key={item.item_id}
            className="flex items-center justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-gray-800">{item.name}</p>
              <span className="mt-0.5 inline-block rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 uppercase">
                {item.category}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-amber-700 tabular-nums">
                  {item.quantity}
                </span>
                <span className="text-[11px] text-amber-500">
                  retirado{item.quantity !== 1 ? "s" : ""}
                </span>
              </div>
              {onReturnItem && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isReturning || !!returningItemId}
                  onClick={() => onReturnItem(item.item_id)}
                  className="h-7 gap-1 border-amber-200 px-2 text-xs font-medium text-amber-700 hover:bg-amber-100 hover:text-amber-800"
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
  )
}
