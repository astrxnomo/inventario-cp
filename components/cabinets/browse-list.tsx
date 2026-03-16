import type { InventoryItem, Selections } from "@/lib/types/cabinets"
import { cn } from "@/lib/utils"
import { Minus, Package, Plus } from "lucide-react"

interface BrowseListProps {
  items: InventoryItem[]
  selections: Selections
  setQty: (itemId: string, qty: number) => void
}

export function BrowseList({ items, selections, setQty }: BrowseListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Package className="mb-2 h-8 w-8 text-gray-200" />
        <p className="text-sm text-gray-400">Sin artículos registrados</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const qty = selections[item.id] ?? 0
        const availableMax = item.quantity - item.reserved_by_others
        const outOfStock = availableMax <= 0

        return (
          <li
            key={item.id}
            className={cn(
              "flex items-center justify-between rounded-lg border px-4 py-3 transition-colors",
              outOfStock
                ? "border-gray-100 bg-gray-50 opacity-50"
                : qty > 0
                  ? "border-primary/20 bg-primary/5"
                  : "border-gray-100 bg-gray-50",
            )}
          >
            {/* Left: name + stock info */}
            <div className="mr-3 min-w-0 flex-1 space-y-1">
              <span className="block truncate text-sm font-medium text-gray-800">
                {item.name}
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "text-[11px] tabular-nums",
                    outOfStock ? "text-amber-600" : "text-gray-400",
                  )}
                >
                  {Math.max(0, availableMax)} disponible
                  {Math.max(0, availableMax) !== 1 ? "s" : ""}
                  {item.in_use > 0 && (
                    <span className="ml-1.5 text-orange-400">
                      · {item.in_use} en uso
                    </span>
                  )}
                </span>

                {item.reserved_by_others > 0 && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                    {item.reserved_by_others} reservado
                    {item.reserved_by_others !== 1 ? "s" : ""} por otros
                  </span>
                )}

                {item.reserved_by_me > 0 && (
                  <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                    {item.reserved_by_me} reservado
                    {item.reserved_by_me !== 1 ? "s" : ""} por ti
                  </span>
                )}

                <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 uppercase">
                  {item.category}
                </span>
              </div>
            </div>

            {/* Right: qty stepper */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label="Reducir cantidad"
                disabled={outOfStock || qty === 0}
                onClick={() => setQty(item.id, qty - 1)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                  qty > 0
                    ? "border-primary/30 bg-white text-primary hover:bg-primary/10"
                    : "cursor-not-allowed border-gray-200 text-gray-300",
                )}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <span className="w-5 text-center text-sm font-semibold text-gray-900 tabular-nums">
                {qty}
              </span>

              <button
                type="button"
                aria-label="Aumentar cantidad"
                disabled={outOfStock || qty >= availableMax}
                onClick={() => setQty(item.id, qty + 1)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                  qty < availableMax && !outOfStock
                    ? "border-primary/30 bg-white text-primary hover:bg-primary/10"
                    : "cursor-not-allowed border-gray-200 text-gray-300",
                )}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
