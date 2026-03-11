"use client"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { returnCabinetItems } from "@/lib/actions/cabinets/return"
import { withdrawCabinetItems } from "@/lib/actions/cabinets/withdraw"
import { fetchCabinetDetailState } from "@/lib/data/cabinets/get-cabinet-detail"
import { fetchInventoryItems } from "@/lib/data/cabinets/get-inventory-items"
import type {
  Cabinet,
  InventoryItem,
  Selections,
  WithdrawnItem,
} from "@/lib/types/cabinets"
import { cn } from "@/lib/utils"
import { ClipboardList, Loader2, Lock, RotateCcw, Unlock } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BrowseList } from "./browse-list"
import { CabinetDetailHeader } from "./cabinet-detail-header"
import { ReturnList } from "./return-list"

interface CabinetDetailProps {
  cabinet: Cabinet | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function CabinetDetail({
  cabinet,
  open,
  onOpenChange,
  userId,
}: CabinetDetailProps) {
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [withdrawnItems, setWithdrawnItems] = useState<WithdrawnItem[]>([])
  const [selections, setSelections] = useState<Selections>({})
  const [sessionId, setSessionId] = useState<string | null>(null)

  const isReturning = sessionId !== null

  useEffect(() => {
    if (!open || !cabinet?.id) {
      setItems([])
      setWithdrawnItems([])
      setSelections({})
      setSessionId(null)
      return
    }

    const cabinetId = cabinet.id

    async function load() {
      setLoading(true)
      const result = await fetchCabinetDetailState(cabinetId, userId)
      setLoading(false)
      if (result.error || !result.data) {
        toast.error("Error al cargar el gabinete")
        return
      }
      const { sessionId, items, withdrawnItems } = result.data
      setSessionId(sessionId)
      setItems(items)
      setWithdrawnItems(withdrawnItems)
    }

    load()
    // userId is the authenticated user's stable ID — it never changes between renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cabinet?.id])

  async function handleWithdraw() {
    const payload = Object.entries(selections).map(([item_id, quantity]) => ({
      item_id,
      quantity,
    }))
    if (payload.length === 0) return

    setSubmitting(true)
    const result = await withdrawCabinetItems({
      cabinetId: cabinet!.id,
      userId,
      items: payload,
    })
    setSubmitting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    setSessionId(result.data)
    setWithdrawnItems(
      items
        .filter((item) => selections[item.id])
        .map((item) => ({
          session_item_id: "",
          item_id: item.id,
          name: item.name,
          category: item.category,
          quantity: selections[item.id],
        })),
    )
    setItems([])
    setSelections({})
  }

  async function handleReturn() {
    setSubmitting(true)
    const result = await returnCabinetItems({ sessionId: sessionId!, userId })
    setSubmitting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    setSessionId(null)
    setWithdrawnItems([])
    const itemsResult = await fetchInventoryItems(cabinet!.id)
    setItems(itemsResult.data ?? [])
  }

  function setQty(itemId: string, qty: number) {
    setSelections((prev) => {
      if (qty <= 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [itemId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [itemId]: qty }
    })
  }

  const totalSelected = Object.values(selections).reduce((a, b) => a + b, 0)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex max-h-[92vh] flex-col">
        {cabinet && (
          <>
            <CabinetDetailHeader cabinet={cabinet} />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex shrink-0 items-center gap-2 px-5 py-2.5">
                {isReturning ? (
                  <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                ) : (
                  <ClipboardList className="h-3.5 w-3.5 text-gray-400" />
                )}
                <span className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                  {isReturning
                    ? "Artículos retirados"
                    : "Inventario disponible"}
                </span>
              </div>
              <Separator className="shrink-0 bg-gray-100" />

              <div className="flex-1 overflow-y-auto px-5 py-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
                  </div>
                ) : isReturning ? (
                  <ReturnList withdrawnItems={withdrawnItems} />
                ) : (
                  <BrowseList
                    items={items}
                    selections={selections}
                    setQty={setQty}
                  />
                )}
              </div>
            </div>

            <DrawerFooter className="shrink-0 border-t border-gray-100 px-5 pt-2 pb-6">
              {isReturning ? (
                <Button
                  size="lg"
                  disabled={submitting}
                  onClick={handleReturn}
                  className="h-12 w-full gap-2 bg-amber-500 text-base font-semibold text-white hover:bg-amber-600"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-5 w-5" />
                  )}
                  Devolver todo y cerrar sesión
                </Button>
              ) : cabinet.status === "locked" ? (
                <Button
                  size="lg"
                  disabled
                  className="h-12 w-full cursor-not-allowed gap-2 text-base font-semibold opacity-40"
                >
                  <Lock className="h-5 w-5" />
                  Gabinete bloqueado
                </Button>
              ) : (
                <Button
                  size="lg"
                  disabled={totalSelected === 0 || submitting || loading}
                  onClick={handleWithdraw}
                  className={cn(
                    "h-12 w-full gap-2 text-base font-semibold transition-colors",
                    totalSelected > 0
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "cursor-not-allowed bg-gray-100 text-gray-400",
                  )}
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Unlock className="h-5 w-5" />
                  )}
                  {totalSelected > 0
                    ? `Retirar ${totalSelected} artículo${totalSelected !== 1 ? "s" : ""}`
                    : "Selecciona artículos"}
                </Button>
              )}
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}
