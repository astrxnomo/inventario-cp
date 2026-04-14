"use client"

import { DataTable } from "@/components/tables/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { cancelReservation } from "@/lib/actions/reservations/cancel-reservation"
import { formatDate, isAfter, isBefore, normalizeSearchText } from "@/lib/utils"
import { CalendarCheckIcon, Clock, X, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { MobileFacetedFilter } from "./mobile-faceted-filter"
import { MobilePagination } from "./mobile-pagination"
import {
  getReservationStatusConfig,
  reservationColumns,
  reservationStatusOptions,
  type ItemReservation,
} from "./reservation-table-columns"

const MOBILE_ITEMS_PER_PAGE = 5

interface ReservationTableProps {
  reservations: ItemReservation[]
}

export function ReservationTable({ reservations }: ReservationTableProps) {
  const router = useRouter()
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [mobileSearch, setMobileSearch] = useState("")
  const [mobileItemFilters, setMobileItemFilters] = useState<string[]>([])
  const [mobileCabinetFilters, setMobileCabinetFilters] = useState<string[]>([])
  const [reservationToCancel, setReservationToCancel] =
    useState<ItemReservation | null>(null)
  const [isCancelling, startCancelling] = useTransition()
  const [currentPage, setCurrentPage] = useState(1)

  const handleDateRangeChange = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
  }

  // Filtrar por rango de fechas (fecha de inicio de reserva)
  const filteredReservations = reservations.filter((reservation) => {
    if (!dateFrom && !dateTo) return true

    const startsAt = new Date(reservation.starts_at)
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null

    if (from && startsAt < from) return false
    if (to && startsAt > to) return false
    return true
  })

  const tableColumns = useMemo(
    () =>
      reservationColumns((reservation) => setReservationToCancel(reservation)),
    [],
  )

  const itemOptions = useMemo(
    () =>
      Array.from(
        new Set(reservations.map((r) => r.item_name).filter(Boolean)),
      ).sort(),
    [reservations],
  )

  const cabinetOptions = useMemo(
    () =>
      Array.from(
        new Set(reservations.map((r) => r.cabinet_name).filter(Boolean)),
      ).sort(),
    [reservations],
  )

  const mobileFilteredReservations = useMemo(() => {
    const search = normalizeSearchText(mobileSearch)

    return filteredReservations.filter((reservation) => {
      const matchesSearch =
        !search ||
        normalizeSearchText(reservation.item_name).includes(search) ||
        normalizeSearchText(reservation.cabinet_name).includes(search)

      const matchesItem =
        mobileItemFilters.length === 0 ||
        mobileItemFilters.includes(reservation.item_name)

      const matchesCabinet =
        mobileCabinetFilters.length === 0 ||
        mobileCabinetFilters.includes(reservation.cabinet_name)

      return matchesSearch && matchesItem && matchesCabinet
    })
  }, [
    filteredReservations,
    mobileSearch,
    mobileItemFilters,
    mobileCabinetFilters,
  ])

  const mobileHasFilters =
    mobileSearch.trim().length > 0 ||
    mobileItemFilters.length > 0 ||
    mobileCabinetFilters.length > 0

  // Reset a página 1 cuando cambian los filtros
  const resetToFirstPage = () => setCurrentPage(1)

  // Paginación móvil
  const totalPages = Math.ceil(
    mobileFilteredReservations.length / MOBILE_ITEMS_PER_PAGE,
  )
  const paginatedReservations = useMemo(() => {
    const startIndex = (currentPage - 1) * MOBILE_ITEMS_PER_PAGE
    const endIndex = startIndex + MOBILE_ITEMS_PER_PAGE
    return mobileFilteredReservations.slice(startIndex, endIndex)
  }, [mobileFilteredReservations, currentPage])

  const handleCancel = () => {
    if (!reservationToCancel) return

    startCancelling(async () => {
      try {
        const result = await cancelReservation(reservationToCancel.id)
        if (result.error) {
          toast.error(result.error)
          return
        }

        toast.success("Reserva cancelada correctamente")
        setReservationToCancel(null)
        router.refresh()
      } catch (error) {
        console.error(error)
        toast.error("No se pudo cancelar la reserva")
      }
    })
  }

  return (
    <>
      <div className="space-y-4 md:hidden">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <Input
              value={mobileSearch}
              onChange={(event) => {
                setMobileSearch(event.target.value)
                resetToFirstPage()
              }}
              placeholder="Buscar por item o gabinete..."
            />
            <div className="flex flex-wrap items-center gap-2">
              <MobileFacetedFilter
                title="Articulo"
                options={itemOptions.map((item) => ({
                  label: item,
                  value: item,
                }))}
                selectedValues={mobileItemFilters}
                onChange={(values) => {
                  setMobileItemFilters(values)
                  resetToFirstPage()
                }}
              />
              <MobileFacetedFilter
                title="Gabinete"
                options={cabinetOptions.map((cabinet) => ({
                  label: cabinet,
                  value: cabinet,
                }))}
                selectedValues={mobileCabinetFilters}
                onChange={(values) => {
                  setMobileCabinetFilters(values)
                  resetToFirstPage()
                }}
              />
              {mobileHasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => {
                    setMobileSearch("")
                    setMobileItemFilters([])
                    setMobileCabinetFilters([])
                    resetToFirstPage()
                  }}
                >
                  Limpiar
                  <X className="ml-2 size-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {mobileFilteredReservations.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
            No hay reservas para mostrar.
          </div>
        ) : (
          <>
            {paginatedReservations.map((reservation) => {
              const startDate = new Date(reservation.starts_at)
              const endDate = new Date(reservation.ends_at)
              const startsSoon = isAfter(startDate, new Date())
              const ended = isBefore(endDate, new Date())
              const status = getReservationStatusConfig(reservation.status)
              const StatusIcon = status.icon

              return (
                <Card key={reservation.id}>
                  <CardHeader className="space-y-3 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">
                        {reservation.item_name}
                      </CardTitle>
                      <Badge
                        variant={status.variant}
                        className={`gap-1 ${status.className}`}
                      >
                        <StatusIcon className="size-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {reservation.item_category} · {reservation.cabinet_name}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cantidad</span>
                      <Badge variant="secondary" className="font-mono">
                        {reservation.quantity}
                      </Badge>
                    </div>

                    <div className="rounded-md border bg-muted/20 p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarCheckIcon
                          className={`size-4 ${startsSoon ? "text-emerald-600" : "text-muted-foreground"}`}
                        />
                        <span className="font-medium">
                          Inicio: {formatDate(startDate, "d MMM yyyy, h:mm a")}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Clock
                          className={`size-4 ${ended ? "text-destructive" : "text-muted-foreground"}`}
                        />
                        <span>
                          Fin: {formatDate(endDate, "d MMM yyyy, h:mm a")}
                        </span>
                      </div>
                    </div>

                    {reservation.note && (
                      <p className="text-sm text-muted-foreground">
                        {reservation.note}
                      </p>
                    )}

                    {reservation.can_cancel &&
                      reservation.status === "active" && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-destructive/30 text-destructive hover:text-destructive"
                          onClick={() => setReservationToCancel(reservation)}
                        >
                          <XCircle className="size-4" />
                          Cancelar reserva
                        </Button>
                      )}
                  </CardContent>
                </Card>
              )
            })}

            <MobilePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={mobileFilteredReservations.length}
              itemsPerPage={MOBILE_ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <div className="hidden md:block">
        <DataTable
          columns={tableColumns}
          data={filteredReservations}
          searchColumn="item_name"
          searchPlaceholder="Buscar por item..."
          filterFields={[
            {
              id: "status",
              label: "Estado",
              options: reservationStatusOptions,
            },
          ]}
          showDateFilter
          dateFilterColumn="starts_at"
          onDateRangeChange={handleDateRangeChange}
          dateFrom={dateFrom}
          dateTo={dateTo}
          pageSize={10}
        />
      </div>

      <ConfirmDialog
        open={!!reservationToCancel}
        onOpenChange={(open) => !open && setReservationToCancel(null)}
        title="Cancelar reserva"
        description={
          reservationToCancel
            ? `Se cancelara la reserva de ${reservationToCancel.item_name}. Esta accion no se puede deshacer.`
            : undefined
        }
        confirmLabel="Si, cancelar"
        cancelLabel="Mantener"
        intent="destructive"
        isLoading={isCancelling}
        onConfirm={handleCancel}
      />
    </>
  )
}
