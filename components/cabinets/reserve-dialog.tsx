"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createGroupReservation } from "@/lib/actions/reservations/create-group-reservation"
import { getReservationAvailability } from "@/lib/data/reservations/get-availability"
import type { CabinetInventoryItem, Selections } from "@/lib/types/cabinets"
import { AlertCircle, CalendarClock, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface ReserveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CabinetInventoryItem[]
  selections: Selections
  onReserved?: () => void
}

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function validateDates(startsAt: string, endsAt: string): string | null {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  if (!startsAt || Number.isNaN(start.getTime())) return null
  if (start < new Date(Date.now() + 5 * 60 * 1000))
    return "El inicio debe ser al menos 5 minutos en el futuro"
  if (!endsAt || Number.isNaN(end.getTime())) return null
  if (end <= start) return "El fin debe ser posterior al inicio"
  if (end.getTime() - start.getTime() > 30 * 24 * 60 * 60 * 1000)
    return "La reserva no puede superar 30 días"
  return null
}

export function ReserveDialog({
  open,
  onOpenChange,
  items,
  selections,
  onReserved,
}: ReserveDialogProps) {
  const now = new Date()
  const defaultStart = new Date(now.getTime() + 30 * 60 * 1000)
  const defaultEnd = new Date(defaultStart.getTime() + 2 * 60 * 60 * 1000)

  const [startsAt, setStartsAt] = useState(toLocalInput(defaultStart))
  const [endsAt, setEndsAt] = useState(toLocalInput(defaultEnd))
  const [note, setNote] = useState("")
  const [availability, setAvailability] = useState<Record<string, number>>({})
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const dateError = validateDates(startsAt, endsAt)
  const startDate = new Date(startsAt)
  const endDate = new Date(endsAt)
  const datesValid =
    !!startsAt &&
    !!endsAt &&
    !dateError &&
    !Number.isNaN(startDate.getTime()) &&
    !Number.isNaN(endDate.getTime()) &&
    endDate > startDate

  const selectedItems = items.filter((item) => (selections[item.id] ?? 0) > 0)

  useEffect(() => {
    if (!open || !datesValid || selectedItems.length === 0) {
      setAvailability({})
      return
    }

    const timeout = setTimeout(async () => {
      setChecking(true)
      const results = await Promise.all(
        selectedItems.map((item) =>
          getReservationAvailability({
            itemId: item.id,
            startsAt: startDate.toISOString(),
            endsAt: endDate.toISOString(),
          }),
        ),
      )
      setChecking(false)

      const avail: Record<string, number> = {}
      selectedItems.forEach((item, i) => {
        if (results[i].data !== null) avail[item.id] = results[i].data!
      })
      setAvailability(avail)
    }, 400)

    return () => clearTimeout(timeout)
  }, [open, startsAt, endsAt, selectedItems])

  const overLimit = selectedItems.filter((item) => {
    const avail = availability[item.id]
    return avail !== undefined && selections[item.id] > avail
  })

  async function handleSubmit() {
    setSubmitting(true)
    const result = await createGroupReservation({
      items: selectedItems.map((item) => ({
        itemId: item.id,
        quantity: selections[item.id],
      })),
      startsAt: startDate.toISOString(),
      endsAt: endDate.toISOString(),
      note: note.trim() || undefined,
    })
    setSubmitting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(
      selectedItems.length === 1
        ? "Reserva creada correctamente"
        : `${selectedItems.length} reservas creadas correctamente`,
    )
    onOpenChange(false)
    onReserved?.()
  }

  const minStr = toLocalInput(new Date(Date.now() + 4 * 60 * 1000))
  const canConfirm =
    datesValid &&
    !submitting &&
    overLimit.length === 0 &&
    selectedItems.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Reservar artículos
          </DialogTitle>
          <DialogDescription>
            Bloquea los artículos seleccionados para la franja horaria indicada.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60dvh] space-y-4 overflow-y-auto py-1">
          {/* Selected items summary (read-only) */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900/50">
            <p className="mb-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Artículos a reservar
            </p>
            <ul className="space-y-1">
              {selectedItems.map((item) => {
                const qty = selections[item.id]
                const avail = availability[item.id]
                const over = avail !== undefined && qty > avail
                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-800 dark:text-gray-200">
                      {item.name}
                    </span>
                    <span
                      className={
                        over
                          ? "font-semibold text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground"
                      }
                    >
                      ×{qty}
                      {over && (
                        <span className="ml-1 text-xs">
                          {avail === 0
                            ? "(Agotado o reservado en ese horario)"
                            : `(Solo ${avail} disponibles en ese horario)`}
                        </span>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="res-start">Inicio</Label>
              <Input
                id="res-start"
                type="datetime-local"
                value={startsAt}
                min={minStr}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="res-end">Fin</Label>
              <Input
                id="res-end"
                type="datetime-local"
                value={endsAt}
                min={startsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>

          {dateError && (
            <p className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {dateError}
            </p>
          )}

          {overLimit.length > 0 && (
            <p className="flex items-start gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {overLimit.length === 1
                  ? `${overLimit[0].name} excede la disponibilidad`
                  : `${overLimit.length} artículos exceden la disponibilidad`}
              </span>
            </p>
          )}

          {checking && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Verificando disponibilidad...
            </p>
          )}

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="res-note">Nota (opcional)</Label>
            <textarea
              id="res-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Motivo o contexto de la reserva"
              rows={2}
              maxLength={500}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring dark:bg-gray-950"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canConfirm}
            className="w-full sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Reservando...
              </>
            ) : (
              `Reservar ${selectedItems.length} artículo${selectedItems.length !== 1 ? "s" : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
