"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type {
  MaintenanceHistoryEntry,
  MaintenanceItem,
} from "@/lib/types/maintenance"
import { deleteMaintenanceHistory } from "@/lib/actions/maintenance/delete-maintenance-history"
import { updateMaintenanceHistory } from "@/lib/actions/maintenance/update-maintenance-history"
import { Check, ChevronsUpDown, Pencil, Trash } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

type MaintenanceHistoryActionsProps = {
  entry: MaintenanceHistoryEntry
  maintenanceItems: MaintenanceItem[]
}

export function MaintenanceHistoryActions({
  entry,
  maintenanceItems,
}: MaintenanceHistoryActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isEditing, startEdit] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState(
    entry.maintenance_id,
  )
  const [dateInput, setDateInput] = useState(() => {
    if (!entry.date) return ""
    const d = new Date(entry.date)
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate(),
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  })

  const selectedLabel =
    maintenanceItems.find((item) => item.id === selectedMaintenanceId)
      ?.item_name ?? "Seleccionar item"

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 px-2 text-muted-foreground hover:text-primary"
          onClick={() => setShowEditDialog(true)}
          aria-label="Editar"
        >
          <Pencil />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 px-2 text-muted-foreground hover:text-destructive"
          onClick={() => setShowDeleteDialog(true)}
          aria-label="Eliminar"
        >
          <Trash />
        </Button>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar historial</DialogTitle>
            <DialogDescription>
              Cambia el item de mantenimiento asociado al registro.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()

              startEdit(async () => {
                if (!selectedMaintenanceId) {
                  toast.error("Debes seleccionar un mantenimiento")
                  return
                }

                const payload: { maintenance_id?: string; date?: string } = {
                  maintenance_id: selectedMaintenanceId,
                }

                if (dateInput) {
                  payload.date = new Date(dateInput).toISOString()
                }

                const res = await updateMaintenanceHistory(entry.id, payload)

                if (res.error) {
                  toast.error(res.error)
                  return
                }

                toast.success("Historial actualizado")
                setShowEditDialog(false)
              })
            }}
          >
            <div className="space-y-2">
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between font-normal"
                  >
                    {selectedLabel}
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Buscar item..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron items.</CommandEmpty>
                      <CommandGroup>
                        {maintenanceItems.map((item) => (
                          <CommandItem
                            key={item.id}
                            value={`${item.item_name} ${item.id}`}
                            onSelect={() => {
                              setSelectedMaintenanceId(item.id)
                              setComboboxOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 size-4",
                                selectedMaintenanceId === item.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <span className="truncate">{item.item_name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Fecha</label>
              <input
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false)
                  setSelectedMaintenanceId(entry.maintenance_id)
                  setDateInput(() => {
                    if (!entry.date) return ""
                    const d = new Date(entry.date)
                    const pad = (n: number) => String(n).padStart(2, "0")
                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
                      d.getDate(),
                    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`
                  })
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isEditing}>
                Guardar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar registro</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara el registro del historial de mantenimiento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={() => {
                startDelete(async () => {
                  const res = await deleteMaintenanceHistory(entry.id)
                  if (res.error) {
                    toast.error(res.error)
                    return
                  }
                  toast.success("Registro eliminado")
                  setShowDeleteDialog(false)
                })
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
