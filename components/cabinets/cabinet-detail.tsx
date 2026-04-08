"use client"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerFooter } from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { addItemsToSession } from "@/lib/actions/cabinets/add-to-session"
import {
  openCabinetForReturn,
  returnCabinetItems,
  returnSingleItemWithQuantity,
} from "@/lib/actions/cabinets/return"
import { withdrawCabinetItems } from "@/lib/actions/cabinets/withdraw"
import { fetchCabinetDetailState } from "@/lib/data/cabinets/get-cabinet-detail"
import { getItemsByCabinet } from "@/lib/data/inventory/get-items-by-cabinet"
import type {
  Cabinet,
  CabinetInventoryItem,
  Selections,
  WithdrawnItem,
} from "@/lib/types/cabinets"
import { cn } from "@/lib/utils"
import {
  CalendarClock,
  ClipboardList,
  Loader2,
  Lock,
  Plus,
  RotateCcw,
  Unlock,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { BrowseList } from "./browse-list"
import { CabinetDetailHeader } from "./cabinet-detail-header"
import { ReserveDialog } from "./reserve-dialog"
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
  const [items, setItems] = useState<CabinetInventoryItem[]>([])
  const [withdrawnItems, setWithdrawnItems] = useState<WithdrawnItem[]>([])
  const [selections, setSelections] = useState<Selections>({})
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [addingMore, setAddingMore] = useState(false)
  const [returningItemId, setReturningItemId] = useState<string | null>(null)
  const [openingForReturn, setOpeningForReturn] = useState(false)
  const [cabinetOpenedForReturn, setCabinetOpenedForReturn] = useState(false)
  const [reserveOpen, setReserveOpen] = useState(false)

  const isReturning = sessionId !== null

  useEffect(() => {
    if (!open || !cabinet?.id) {
      setItems([])
      setWithdrawnItems([])
      setSelections({})
      setSessionId(null)
      setAddingMore(false)
      setOpeningForReturn(false)
      setCabinetOpenedForReturn(false)
      setReserveOpen(false)
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
      setCabinetOpenedForReturn(false)
    }

    load()
  }, [open, cabinet?.id, userId])

  async function handleStartAddMore() {
    setAddingMore(true)
    if (items.length === 0) {
      setLoading(true)
      const result = await getItemsByCabinet(cabinet!.id, userId)
      setLoading(false)
      setItems(result.data ?? [])
    }
  }

  async function handleWithdraw() {
    const payload = Object.entries(selections).map(([item_id, quantity]) => ({
      item_id,
      quantity,
    }))
    if (payload.length === 0) return

    setSubmitting(true)

    if (addingMore && sessionId) {
      const result = await addItemsToSession({
        sessionId,
        userId,
        items: payload,
      })
      setSubmitting(false)

      if (result.error) {
        toast.error(result.error)
        return
      }

      setAddingMore(false)
      setSelections({})
      setLoading(true)
      const detail = await fetchCabinetDetailState(cabinet!.id, userId)
      setLoading(false)
      if (detail.data) {
        setWithdrawnItems(detail.data.withdrawnItems)
        setItems([])
      }
    } else {
      const result = await withdrawCabinetItems({
        cabinetId: cabinet!.id,
        cabinetLocation: cabinet!.location ?? undefined,
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
  }

  async function handleReserve() {
    if (!cabinet) return
    if (items.length === 0) {
      setLoading(true)
      const result = await getItemsByCabinet(cabinet.id, userId)
      setLoading(false)
      setItems(result.data ?? [])
    }
    setReserveOpen(true)
  }

  async function refreshItems() {
    if (!cabinet) return
    setLoading(true)
    const result = await getItemsByCabinet(cabinet.id, userId)
    setLoading(false)
    if (result.data) setItems(result.data)
  }

  async function handleReturn() {
    if (!cabinetOpenedForReturn) {
      toast.error("Primero abre el gabinete para devolver los artículos")
      return
    }

    setSubmitting(true)
    const result = await returnCabinetItems({ sessionId: sessionId!, userId })
    setSubmitting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    setSessionId(null)
    setCabinetOpenedForReturn(false)
    setWithdrawnItems([])
    const itemsResult = await getItemsByCabinet(cabinet!.id, userId)
    setItems(itemsResult.data ?? [])
  }

  async function handleReturnSingle(itemId: string, quantity: number) {
    if (!cabinetOpenedForReturn) {
      const opened = await handleOpenForReturn()
      if (!opened) return
    }

    setReturningItemId(itemId)
    const result = await returnSingleItemWithQuantity({
      sessionId: sessionId!,
      userId,
      itemId,
      quantity,
    })
    setReturningItemId(null)

    if (result.error) {
      toast.error(result.error)
      return
    }

    const remaining = withdrawnItems
      .map((item) =>
        item.item_id === itemId
          ? { ...item, quantity: item.quantity - quantity }
          : item,
      )
      .filter((item) => item.quantity > 0)

    setWithdrawnItems(remaining)

    if (remaining.length === 0) {
      setSessionId(null)
      setCabinetOpenedForReturn(false)
      const itemsResult = await getItemsByCabinet(cabinet!.id, userId)
      setItems(itemsResult.data ?? [])
    }
  }

  async function handleOpenForReturn() {
    if (!cabinet?.location) {
      toast.error("La ubicación del gabinete es requerida para abrirlo")
      return false
    }

    setOpeningForReturn(true)
    const result = await openCabinetForReturn({
      userId,
      cabinetLocation: cabinet.location,
    })
    setOpeningForReturn(false)

    if (result.error) {
      toast.error(result.error)
      return false
    }

    setCabinetOpenedForReturn(true)
    toast.success("Gabinete abierto, ahora confirma la devolución")
    return true
  }

  async function handleReturnAllFlow() {
    if (!cabinetOpenedForReturn) {
      await handleOpenForReturn()
      return
    }

    await handleReturn()
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
                {isReturning && !addingMore ? (
                  <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                ) : isReturning ? (
                  <Plus className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <ClipboardList className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                )}
                <span className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  {isReturning && !addingMore
                    ? "Artículos retirados"
                    : isReturning
                      ? "Agregar más artículos"
                      : "Inventario disponible"}
                </span>
              </div>
              <Separator className="shrink-0 bg-gray-100 dark:bg-gray-800" />

              <div className="flex-1 overflow-y-auto px-5 py-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-300 dark:text-gray-600" />
                  </div>
                ) : isReturning && !addingMore ? (
                  <ReturnList
                    withdrawnItems={withdrawnItems}
                    onReturnItem={handleReturnSingle}
                    returningItemId={returningItemId}
                    canConfirmReturn={cabinetOpenedForReturn}
                  />
                ) : (
                  <BrowseList
                    items={items}
                    selections={selections}
                    setQty={setQty}
                  />
                )}
              </div>
            </div>

            <DrawerFooter className="shrink-0 border-t border-gray-100 px-5 pt-2 pb-6 dark:border-gray-800">
              {isReturning && addingMore ? (
                <div className="flex gap-2">
                  <Button
                    size="lg"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => {
                      setAddingMore(false)
                      setSelections({})
                    }}
                    className="h-12 gap-2 font-semibold"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="lg"
                    disabled={totalSelected === 0 || submitting || loading}
                    onClick={handleWithdraw}
                    className={cn(
                      "h-12 flex-1 gap-2 text-base font-semibold transition-colors",
                      totalSelected > 0
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600",
                    )}
                  >
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                    {totalSelected > 0
                      ? `Agregar ${totalSelected} artículo${totalSelected !== 1 ? "s" : ""}`
                      : "Selecciona artículos"}
                  </Button>
                </div>
              ) : isReturning ? (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    disabled={submitting || loading || openingForReturn}
                    onClick={handleStartAddMore}
                    className="h-10 w-full gap-2 border-border bg-background font-semibold text-foreground hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                    Retirar más artículos
                  </Button>
                  <Button
                    size="lg"
                    disabled={submitting || loading || openingForReturn}
                    onClick={handleReturnAllFlow}
                    className="h-12 w-full gap-2 bg-warning text-base font-semibold hover:bg-warning/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                  >
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : cabinetOpenedForReturn ? (
                      <RotateCcw className="h-5 w-5" />
                    ) : (
                      <Unlock className="h-5 w-5" />
                    )}
                    {cabinetOpenedForReturn
                      ? "Devolver todo"
                      : "Abrir gabinete"}
                  </Button>
                </>
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
                <div className="flex gap-2">
                  <Button
                    size="lg"
                    disabled={totalSelected === 0 || submitting || loading}
                    onClick={handleWithdraw}
                    className={cn(
                      "h-12 flex-1 gap-2 text-base font-semibold transition-colors",
                      totalSelected > 0
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600",
                    )}
                  >
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Unlock className="h-5 w-5" />
                    )}
                    {totalSelected > 0 ? `Retirar ${totalSelected}` : "Retirar"}
                  </Button>

                  {cabinet.location === "En sitio" && (
                    <Button
                      size="lg"
                      variant="outline"
                      disabled={totalSelected === 0 || submitting || loading}
                      onClick={handleReserve}
                      className="h-12 gap-2 px-5 font-semibold"
                    >
                      <CalendarClock className="h-4 w-4" />
                      Reservar
                    </Button>
                  )}
                </div>
              )}
            </DrawerFooter>

            <ReserveDialog
              open={reserveOpen}
              onOpenChange={setReserveOpen}
              items={items}
              selections={selections}
              onReserved={refreshItems}
            />
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}
