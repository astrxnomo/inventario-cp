"use client"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createItemMaintenance } from "@/lib/actions/maintenance/create-item-maintenance"
import type { AdminFormState } from "@/lib/actions/shared"
import type { InventoryItem } from "@/lib/types/inventory"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

type CreateMaintenanceDialogProps = {
  availableItems: InventoryItem[]
}

export function CreateMaintenanceDialog({
  availableItems,
}: CreateMaintenanceDialogProps) {
  const [open, setOpen] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string>("")
  const [state, setState] = useState<AdminFormState>({
    success: false,
    error: null,
    fieldErrors: {},
  })
  const [isPending, startTransition] = useTransition()

  const sortedItems = useMemo(
    () => [...availableItems].sort((a, b) => a.name.localeCompare(b.name)),
    [availableItems],
  )

  const selectedItemName = useMemo(
    () => sortedItems.find((item) => item.id === selectedItem)?.name,
    [sortedItems, selectedItem],
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const result = await createItemMaintenance(state, formData)
      setState(result)

      if (result.success) {
        toast.success("Item agregado a mantenimiento")
        form.reset()
        setOpen(false)
        setSelectedItem("")
        return
      }

      if (result.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8" disabled={sortedItems.length === 0}>
          <Plus className="size-4" />
          Agregar item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Agregar item a mantenimiento</DialogTitle>
          <DialogDescription>
            Selecciona un item y define cada cuantos dias requiere
            mantenimiento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {state.error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="item_id">Item</Label>
            <input type="hidden" name="item_id" value={selectedItem} />

            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="item_id"
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedItemName || "Seleccionar item"}
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
                      {sortedItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={`${item.name} ${item.id}`}
                          onSelect={() => {
                            setSelectedItem(item.id)
                            setComboboxOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 size-4",
                              selectedItem === item.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <span className="truncate">{item.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {state.fieldErrors?.item_id && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.item_id}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval_days">Intervalo (dias)</Label>
            <Input
              id="interval_days"
              name="interval_days"
              type="number"
              min={1}
              defaultValue={30}
              required
            />
            {state.fieldErrors?.interval_days && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.interval_days}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              maxLength={500}
              placeholder="Detalles del mantenimiento, pasos o notas"
              rows={3}
            />
            {state.fieldErrors?.description && (
              <p className="text-sm text-destructive">
                {state.fieldErrors.description}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !selectedItem}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
