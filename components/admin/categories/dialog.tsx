"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useState } from "react"
import { CategoryForm } from "./form"

export function CategoryFormDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8">
          <Plus className="size-4" />
          Nueva Categoría
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear categoría</DialogTitle>
        </DialogHeader>
        <CategoryForm
          isDialog
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
