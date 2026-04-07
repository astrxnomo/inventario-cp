"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MobilePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export function MobilePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: MobilePaginationProps) {
  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
          {totalPages <= 5 ? (
            // Mostrar todos los números si son 5 o menos
            Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="size-8 p-0"
              >
                {page}
              </Button>
            ))
          ) : (
            // Mostrar con elipsis si son más de 5
            <>
              {currentPage > 2 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    className="size-8 p-0"
                  >
                    1
                  </Button>
                  {currentPage > 3 && (
                    <span className="px-1 text-sm text-muted-foreground">
                      ...
                    </span>
                  )}
                </>
              )}

              {currentPage > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  className="size-8 p-0"
                >
                  {currentPage - 1}
                </Button>
              )}

              <Button variant="default" size="sm" className="size-8 p-0">
                {currentPage}
              </Button>

              {currentPage < totalPages && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  className="size-8 p-0"
                >
                  {currentPage + 1}
                </Button>
              )}

              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && (
                    <span className="px-1 text-sm text-muted-foreground">
                      ...
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    className="size-8 p-0"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Mostrando {startItem} - {endItem} de {totalItems} resultados
      </p>
    </div>
  )
}
