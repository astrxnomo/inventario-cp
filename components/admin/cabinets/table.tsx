"use client"

import * as React from "react"

import { DataTable } from "@/components/tables/data-table"
import { RefreshButton } from "@/components/ui/refresh-button"
import { toast } from "sonner"
import { lockAllCabinets } from "@/lib/actions/cabinets/lock-all"
import { unlockAllCabinets } from "@/lib/actions/cabinets/unlock-all"
import { Lock, Unlock } from "lucide-react"
import { Cabinet } from "@/lib/types/cabinets"
import { cabinetColumns, statusOptions } from "./columns"
import { CreateCabinetDialog } from "./create-dialog"
import { Button } from "@/components/ui/button"

interface CabinetsTableProps {
  data: Cabinet[]
}

export function CabinetsTable({ data }: CabinetsTableProps) {
  const [dateFrom, setDateFrom] = React.useState<string | undefined>()
  const [dateTo, setDateTo] = React.useState<string | undefined>()
  const [isLocking, startLock] = React.useTransition()

  const handleDateRangeChange = (from: string, to: string) => {
    setDateFrom(from)
    setDateTo(to)
  }

  const filteredData = React.useMemo(() => {
    if (!dateFrom && !dateTo) return data

    return data.filter((item) => {
      const date = new Date(item.created_at)
      const from = dateFrom ? new Date(dateFrom) : null
      const to = dateTo ? new Date(dateTo) : null

      if (from && date < from) return false
      if (to && date > to) return false
      return true
    })
  }, [data, dateFrom, dateTo])

  return (
    <div className="space-y-4">
      <DataTable
        columns={cabinetColumns}
        data={filteredData}
        searchColumn="name"
        searchPlaceholder="Buscar gabinetes..."
        filterFields={[
          {
            id: "status",
            label: "Estado",
            options: statusOptions,
          },
        ]}
        showDateFilter={true}
        dateFilterColumn="created_at"
        onDateRangeChange={handleDateRangeChange}
        dateFrom={dateFrom}
        dateTo={dateTo}
        actions={
          <div className="flex gap-2">
            <RefreshButton />
            <Button
              size="sm"
              className="h-8"
              variant={"destructive"}
              onClick={() =>
                startLock(async () => {
                  try {
                    const allLocked =
                      data.length > 0 &&
                      data.every((d) => d.status === "locked")
                    const res = allLocked
                      ? await unlockAllCabinets()
                      : await lockAllCabinets()
                    if (res && res.error) {
                      toast.error(res.error)
                    } else {
                      toast.success(
                        allLocked
                          ? "Todos los gabinetes han sido desbloqueados"
                          : "Todos los gabinetes han sido bloqueados",
                      )
                    }
                  } catch (e) {
                    toast.error("Error al alternar bloqueo de gabinetes")
                    console.error(e)
                  }
                })
              }
              disabled={isLocking}
            >
              {data.length > 0 && data.every((d) => d.status === "locked") ? (
                <>
                  <Unlock className="size-4" />
                  <span>Desbloquear todos</span>
                </>
              ) : (
                <>
                  <Lock className="size-4" />
                  <span>Bloquear todos</span>
                </>
              )}
            </Button>
            <CreateCabinetDialog />
          </div>
        }
      />
    </div>
  )
}
