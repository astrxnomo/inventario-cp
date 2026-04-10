"use client"

import { useState, useTransition } from "react"
import { Lock, MapPin, Unlock } from "lucide-react"
import { toast } from "sonner"

import { openCabinetAsAdmin } from "@/lib/actions/cabinets/open-cabinet-admin"
import type { Cabinet } from "@/lib/types/cabinets"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface QuickOpenSectionProps {
  cabinets: Cabinet[]
}

export function QuickOpenSection({ cabinets }: QuickOpenSectionProps) {
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [isOpening, startOpening] = useTransition()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8">
          <Unlock className="size-4" />
          Apertura rapida
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Apertura rapida de gabinetes</DialogTitle>
          <DialogDescription>
            Selecciona un gabinete para abrirlo sin salir de administracion.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end">
          <Badge variant="outline">{cabinets.length} gabinetes</Badge>
        </div>

        <div className="grid max-h-[65vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
          {cabinets.map((cabinet) => {
            const hasLocation = Boolean(cabinet.location?.trim())
            const isLocked = cabinet.status === "locked"
            const disabled = isLocked || !hasLocation || isOpening
            const isCurrent = openingId === cabinet.id && isOpening

            return (
              <div
                key={cabinet.id}
                className="rounded-xl border border-border/60 bg-background/80 px-3 py-2"
              >
                <div className="mb-2 min-w-0">
                  <p className="truncate text-sm font-medium">{cabinet.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {cabinet.location || "Sin ubicacion"}
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  disabled={disabled}
                  onClick={() =>
                    startOpening(async () => {
                      setOpeningId(cabinet.id)
                      const result = await openCabinetAsAdmin({
                        cabinetId: cabinet.id,
                        cabinetLocation: cabinet.location,
                      })

                      if (result?.error) {
                        toast.error(result.error)
                      } else {
                        toast.success(`Gabinete ${cabinet.name} abierto`)
                      }

                      setOpeningId(null)
                    })
                  }
                  className="h-8 w-full"
                >
                  {isLocked ? (
                    <Lock className="size-4" />
                  ) : (
                    <Unlock className="size-4" />
                  )}
                  <span>
                    {isLocked
                      ? "Bloqueado"
                      : isCurrent
                        ? "Abriendo..."
                        : "Abrir"}
                  </span>
                </Button>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
