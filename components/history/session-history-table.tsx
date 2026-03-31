"use client"

import { DataTable } from "@/components/tables/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn, formatDate } from "@/lib/utils"
import { Box, ClipboardClock, LockIcon, Unlock, X } from "lucide-react"
import { useMemo, useState } from "react"
import { MobileFacetedFilter } from "./mobile-faceted-filter"
import {
  sessionHistoryColumns,
  type HistorySession,
} from "./session-history-table-columns"
import { SessionTimeline } from "./session-timeline"

interface SessionHistoryTableProps {
  sessions: HistorySession[]
}

export function SessionHistoryTable({ sessions }: SessionHistoryTableProps) {
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [mobileSearch, setMobileSearch] = useState("")
  const [mobileItemFilters, setMobileItemFilters] = useState<string[]>([])
  const [mobileCabinetFilters, setMobileCabinetFilters] = useState<string[]>([])
  const [selectedSession, setSelectedSession] = useState<HistorySession | null>(
    null,
  )

  const handleDateRangeChange = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
  }

  // Filtrar por rango de fechas
  const filteredSessions = sessions.filter((session) => {
    if (!dateFrom && !dateTo) return true

    const openedAt = new Date(session.opened_at)
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null

    if (from && openedAt < from) return false
    if (to && openedAt > to) return false
    return true
  })

  const tableColumns = useMemo(
    () => sessionHistoryColumns((session) => setSelectedSession(session)),
    [],
  )

  const itemOptions = useMemo(
    () =>
      Array.from(
        new Set(
          sessions
            .flatMap((session) => session.items ?? [])
            .map((item) => item.name)
            .filter(Boolean),
        ),
      ).sort(),
    [sessions],
  )

  const cabinetOptions = useMemo(
    () =>
      Array.from(
        new Set(
          sessions.map((session) => session.cabinet_name).filter(Boolean),
        ),
      ).sort(),
    [sessions],
  )

  const mobileFilteredSessions = useMemo(() => {
    const search = mobileSearch.trim().toLowerCase()

    return filteredSessions.filter((session) => {
      const matchesSearch =
        !search ||
        session.cabinet_name.toLowerCase().includes(search) ||
        (session.items ?? []).some((item) =>
          item.name.toLowerCase().includes(search),
        )

      const matchesCabinet =
        mobileCabinetFilters.length === 0 ||
        mobileCabinetFilters.includes(session.cabinet_name)

      const matchesItem =
        mobileItemFilters.length === 0 ||
        (session.items ?? []).some((item) =>
          mobileItemFilters.includes(item.name),
        )

      return matchesSearch && matchesCabinet && matchesItem
    })
  }, [filteredSessions, mobileSearch, mobileCabinetFilters, mobileItemFilters])

  const mobileHasFilters =
    mobileSearch.trim().length > 0 ||
    mobileItemFilters.length > 0 ||
    mobileCabinetFilters.length > 0

  return (
    <>
      <div className="space-y-4 md:hidden">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <Input
              value={mobileSearch}
              onChange={(event) => setMobileSearch(event.target.value)}
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
                onChange={setMobileItemFilters}
              />
              <MobileFacetedFilter
                title="Gabinete"
                options={cabinetOptions.map((cabinet) => ({
                  label: cabinet,
                  value: cabinet,
                }))}
                selectedValues={mobileCabinetFilters}
                onChange={setMobileCabinetFilters}
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
                  }}
                >
                  Limpiar
                  <X className="ml-2 size-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {mobileFilteredSessions.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
            No hay sesiones para mostrar.
          </div>
        ) : (
          mobileFilteredSessions.map((session) => {
            const openedAt = new Date(session.opened_at)
            const closedAt = session.closed_at
              ? new Date(session.closed_at)
              : null

            return (
              <Card key={session.id}>
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">
                      {session.cabinet_name}
                    </CardTitle>
                    <Badge
                      className={cn(
                        closedAt
                          ? "dark:text-destructive-400 bg-destructive text-destructive dark:bg-destructive/20"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
                      )}
                    >
                      {closedAt ? <LockIcon /> : <Unlock />}
                      {closedAt ? "Cerrada" : "En curso"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Articulos registrados
                    </span>
                    <Badge variant="outline" className="font-mono">
                      <Box className="mr-1 size-3" />
                      {session.items?.length ?? 0}
                    </Badge>
                  </div>
                  <div className="rounded-md border bg-muted/20 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Unlock className="size-4 text-muted-foreground" />
                      <span>{formatDate(openedAt, "d MMM yyyy, h:mm a")}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {closedAt && (
                        <>
                          <LockIcon className="size-4 text-muted-foreground" />
                          {formatDate(closedAt, "d MMM yyyy, h:mm a")}
                        </>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedSession(session)}
                  >
                    <ClipboardClock className="size-4" />
                    Ver detalles
                  </Button>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <div className="hidden md:block">
        <DataTable
          columns={tableColumns}
          data={filteredSessions}
          searchColumn="cabinet_name"
          searchPlaceholder="Buscar por gabinete..."
          showDateFilter
          dateFilterColumn="opened_at"
          onDateRangeChange={handleDateRangeChange}
          dateFrom={dateFrom}
          dateTo={dateTo}
          pageSize={10}
        />
      </div>

      <SessionTimeline
        session={selectedSession}
        open={!!selectedSession}
        onOpenChange={(open) => !open && setSelectedSession(null)}
      />
    </>
  )
}
