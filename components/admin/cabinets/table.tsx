"use client"

import * as React from "react"

import { DataTable } from "@/components/tables/data-table"
import { RefreshButton } from "@/components/ui/refresh-button"
import { Cabinet } from "@/lib/types/cabinets"
import { cabinetColumns, statusOptions } from "./columns"
import { CreateCabinetDialog } from "./create-dialog"

interface CabinetsTableProps {
  data: Cabinet[]
}

export function CabinetsTable({ data }: CabinetsTableProps) {
  const [dateFrom, setDateFrom] = React.useState<string | undefined>()
  const [dateTo, setDateTo] = React.useState<string | undefined>()

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
            <CreateCabinetDialog />
          </div>
        }
      />
    </div>
  )
}
