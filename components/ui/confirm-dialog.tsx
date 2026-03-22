"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ConfirmDialogProps {
  title: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  intent?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
  isLoading?: boolean
  onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>
  onCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  intent = "default",
  isLoading = false,
  onConfirm,
  onCancel,
  children,
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isLoading) return
    await onConfirm(e)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={intent}
            disabled={isLoading}
            onClick={handleConfirm}
          >
            {isLoading ? "Procesando..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
