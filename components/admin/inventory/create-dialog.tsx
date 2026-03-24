"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { CabinetRow } from "@/lib/types/cabinets"
import type { Category } from "@/lib/types/categories"
import { Plus } from "lucide-react"
import { useState } from "react"
import { InventoryForm } from "./form"

interface CreateInventoryDialogProps {
  categories: Category[]
  cabinets: CabinetRow[]
}

export function CreateInventoryDialog({
  categories,
  cabinets,
}: CreateInventoryDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8">
          <Plus className="size-4" />
          Nuevo Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Crear nuevo item</DialogTitle>
          <DialogDescription>
            Completa los detalles del nuevo artículo.
          </DialogDescription>
        </DialogHeader>
        <InventoryForm
          categories={categories}
          cabinets={cabinets}
          isDialog
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
