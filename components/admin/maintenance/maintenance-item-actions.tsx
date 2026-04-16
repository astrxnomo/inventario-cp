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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import type { InventoryItem } from "@/lib/types/inventory"
import type { MaintenanceItem } from "@/lib/types/maintenance"
import { deleteItemMaintenance } from "@/lib/actions/maintenance/delete-item-maintenance"
import { updateItemMaintenance } from "@/lib/actions/maintenance/update-item-maintenance"
import { Check, ChevronsUpDown, Pencil, Trash } from "lucide-react"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

type MaintenanceItemActionsProps = {
  item: MaintenanceItem
  inventoryItems: InventoryItem[]
}

export function MaintenanceItemActions({
  item,
  inventoryItems,
}: MaintenanceItemActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isEditing, startEdit] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const [selectedItemId, setSelectedItemId] = useState(item.item_id)
  const [intervalDays, setIntervalDays] = useState(String(item.interval_days))
  const [description, setDescription] = useState(item.description ?? "")
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const sortedItems = useMemo(
    () => [...inventoryItems].sort((a, b) => a.name.localeCompare(b.name)),
    [inventoryItems],
  )

  const selectedName =
    sortedItems.find((inventoryItem) => inventoryItem.id === selectedItemId)
      ?.name ?? "Seleccionar item"

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
            <DialogTitle>Editar mantenimiento</DialogTitle>
            <DialogDescription>
              Actualiza la configuracion del mantenimiento.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()

              startEdit(async () => {
                const parsedInterval = Number(intervalDays)
                if (!selectedItemId) {
                  toast.error("Debes seleccionar un item")
                  return
                }

                if (!Number.isInteger(parsedInterval) || parsedInterval < 1) {
                  toast.error(
                    "El intervalo debe ser un numero entero mayor o igual a 1",
                  )
                  return
                }

                const res = await updateItemMaintenance(item.id, {
                  item_id: selectedItemId,
                  interval_days: parsedInterval,
                  description,
                })

                if (res.error) {
                  toast.error(res.error)
                  return
                }

                toast.success("Mantenimiento actualizado")
                setShowEditDialog(false)
              })
            }}
          >
            <div className="space-y-2">
              <Label htmlFor={`item-${item.id}`}>Item</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id={`item-${item.id}`}
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    disabled={item.has_history}
                    className="w-full justify-between font-normal"
                  >
                    {selectedName}
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
                        {sortedItems.map((inventoryItem) => (
                          <CommandItem
                            key={inventoryItem.id}
                            value={`${inventoryItem.name} ${inventoryItem.id}`}
                            onSelect={() => {
                              setSelectedItemId(inventoryItem.id)
                              setComboboxOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 size-4",
                                selectedItemId === inventoryItem.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <span className="truncate">
                              {inventoryItem.name}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {item.has_history && (
                <p className="text-xs text-muted-foreground">
                  Este mantenimiento tiene historial. El item no se puede
                  cambiar, pero puedes actualizar intervalo y descripcion.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`interval-${item.id}`}>Intervalo (dias)</Label>
              <Input
                id={`interval-${item.id}`}
                type="number"
                min={1}
                value={intervalDays}
                onChange={(e) => setIntervalDays(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`description-${item.id}`}>
                Descripcion (opcional)
              </Label>
              <Textarea
                id={`description-${item.id}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                placeholder="Detalles del mantenimiento, pasos o notas"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false)
                  setSelectedItemId(item.item_id)
                  setIntervalDays(String(item.interval_days))
                  setDescription(item.description ?? "")
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
            <AlertDialogTitle>Eliminar mantenimiento</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara la configuracion de mantenimiento para este
              item.
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
                  const res = await deleteItemMaintenance(item.id)
                  if (res.error) {
                    toast.error(res.error)
                    return
                  }
                  toast.success("Mantenimiento eliminado")
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
