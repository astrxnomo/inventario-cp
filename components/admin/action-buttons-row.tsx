"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Pencil, Trash } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

interface ActionButtonsRowProps {
  onEdit: () => void
  onDelete: () => Promise<{ error?: string } | void>
  // additional inline actions to render before edit/delete
  actions?: {
    icon: React.ReactNode
    onClick: () => void
    label: string
    visible?: boolean
    disabled?: boolean
  }[]
  deleteDescription?: React.ReactNode
  editLabel?: string
  deleteLabel?: string
}

export function ActionButtonsRow({
  onEdit,
  onDelete,
  actions = [],
  deleteDescription = "Esta acción no se puede deshacer.",
  editLabel = "Editar",
  deleteLabel = "Eliminar",
}: ActionButtonsRowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, startDelete] = useTransition()

  const handleDelete = () => {
    startDelete(async () => {
      try {
        const result = await onDelete()
        if (result && result.error) {
          toast.error(result.error)
        } else {
          toast.success("Elemento eliminado correctamente")
          setShowDeleteDialog(false)
        }
      } catch (error) {
        toast.error("Error al eliminar el elemento")
        console.error(error)
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        {actions.map((a, i) =>
          a.visible === false ? null : (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 text-muted-foreground ${a.disabled ? "cursor-not-allowed opacity-50" : "hover:text-primary"}`}
                  onClick={a.onClick}
                  aria-label={a.label}
                  disabled={a.disabled}
                >
                  {a.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{a.label}</TooltipContent>
            </Tooltip>
          ),
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={onEdit}
              aria-label={editLabel}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{editLabel}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
              aria-label={deleteLabel}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{deleteLabel}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="¿Estás seguro?"
        description={deleteDescription}
        onConfirm={handleDelete}
        confirmLabel="Eliminar"
        intent="destructive"
        isLoading={isDeleting}
      />
    </div>
  )
}
