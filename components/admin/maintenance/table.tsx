"use client"

import { DataTable } from "@/components/tables/data-table"
import { RefreshButton } from "@/components/ui/refresh-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { InventoryItem } from "@/lib/types/inventory"
import type {
  MaintenanceHistoryEntry,
  MaintenanceItem,
} from "@/lib/types/maintenance"
import { useMemo, useState } from "react"
import { maintenanceColumns, maintenanceHistoryColumns } from "./columns"
import { CreateMaintenanceDialog } from "./create-dialog"

type MaintenanceTablesProps = {
  maintenanceItems: MaintenanceItem[]
  history: MaintenanceHistoryEntry[]
  inventoryItems: InventoryItem[]
}

export function MaintenanceTables({
  maintenanceItems,
  history,
  inventoryItems,
}: MaintenanceTablesProps) {
  const [historyDateFrom, setHistoryDateFrom] = useState("")
  const [historyDateTo, setHistoryDateTo] = useState("")

  const maintenanceOptions = useMemo(
    () =>
      Array.from(new Set(maintenanceItems.map((item) => item.item_name)))
        .sort((a, b) => a.localeCompare(b))
        .map((itemName) => ({ label: itemName, value: itemName })),
    [maintenanceItems],
  )

  const cabinetOptions = useMemo(
    () =>
      Array.from(
        new Set(
          maintenanceItems
            .map((item) => item.cabinet_name)
            .filter((name): name is string => Boolean(name)),
        ),
      )
        .sort((a, b) => a.localeCompare(b))
        .map((cabinetName) => ({ label: cabinetName, value: cabinetName })),
    [maintenanceItems],
  )

  const filteredHistory = useMemo(() => {
    if (!historyDateFrom && !historyDateTo) return history

    return history.filter((entry) => {
      const date = new Date(entry.date)
      const from = historyDateFrom
        ? new Date(`${historyDateFrom}T00:00:00`)
        : null
      const to = historyDateTo ? new Date(`${historyDateTo}T23:59:59`) : null

      if (from && date < from) return false
      if (to && date > to) return false
      return true
    })
  }, [history, historyDateFrom, historyDateTo])

  return (
    <Tabs defaultValue="Articulo" className="space-y-4">
      <TabsList>
        <TabsTrigger value="Articulo">Articulos</TabsTrigger>
        <TabsTrigger value="history">Historial de mantenimientos</TabsTrigger>
      </TabsList>

      <TabsContent value="Articulo" className="space-y-4">
        <DataTable
          columns={maintenanceColumns}
          data={maintenanceItems}
          filterFields={[
            {
              id: "item_name",
              label: "Articulo",
              options: maintenanceOptions,
            },
            {
              id: "cabinet_name",
              label: "Gabinete",
              options: cabinetOptions,
            },
          ]}
          actions={
            <div className="flex gap-2">
              <RefreshButton />
              <CreateMaintenanceDialog availableItems={inventoryItems} />
            </div>
          }
          meta={{ inventoryItems }}
        />
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <DataTable
          columns={maintenanceHistoryColumns}
          data={filteredHistory}
          filterFields={[
            {
              id: "item_name",
              label: "Articulo",
              options: maintenanceOptions,
            },
          ]}
          showDateFilter
          dateFilterColumn="date"
          onDateRangeChange={(from, to) => {
            setHistoryDateFrom(from)
            setHistoryDateTo(to)
          }}
          dateFrom={historyDateFrom}
          dateTo={historyDateTo}
          actions={<RefreshButton />}
          meta={{ maintenanceItems }}
        />
      </TabsContent>
    </Tabs>
  )
}
