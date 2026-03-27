"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { registerMaintenanceHistory } from "@/lib/actions/maintenance/register-maintenance-history"
import { Loader2, Wrench } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

type RegisterHistoryButtonProps = {
  maintenanceId: string
  itemName: string
}

function formatLocalDatetime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function RegisterHistoryButton({
  maintenanceId,
  itemName,
}: RegisterHistoryButtonProps) {
  const [open, setOpen] = useState(false)
  const [dateInput, setDateInput] = useState(() =>
    formatLocalDatetime(new Date()),
  )
  const [isPending, startTransition] = useTransition()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wrench className="size-4" /> Registrar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>Registrar mantenimiento</DialogTitle>
            <DialogDescription>
              Selecciona la fecha en que se realizó el mantenimiento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Fecha</Label>
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false)
                setDateInput(formatLocalDatetime(new Date()))
              }}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={() =>
                startTransition(async () => {
                  try {
                    const res = await registerMaintenanceHistory(
                      maintenanceId,
                      dateInput ? new Date(dateInput).toISOString() : undefined,
                    )
                    if (res.error) {
                      toast.error(res.error)
                      return
                    }
                    toast.success(`Mantenimiento registrado para ${itemName}`)
                    setOpen(false)
                    setDateInput(formatLocalDatetime(new Date()))
                  } catch (e) {
                    toast.error("Error al registrar mantenimiento")
                    console.error(e)
                  }
                })
              }
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
