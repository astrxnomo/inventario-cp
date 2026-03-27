import { MaintenanceTables } from "@/components/admin/maintenance/table"
import { getMaintenanceHistory } from "@/lib/data/maintenance/get-maintenance-history"
import { getMaintenanceItems } from "@/lib/data/maintenance/get-maintenance-items"
import { getAllItems } from "@/lib/data/inventory/get-all-items"

export default async function AdminMaintenancePage() {
  const [maintenanceItems, history, inventoryItems] = await Promise.all([
    getMaintenanceItems(),
    getMaintenanceHistory(),
    getAllItems(),
  ])

  return (
    <main id="main-content" className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mantenimiento
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {maintenanceItems.length} item
            {maintenanceItems.length !== 1 ? "s" : ""} con mantenimiento
            configurado · {history.length} registro
            {history.length !== 1 ? "s" : ""} historico
            {history.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <MaintenanceTables
        maintenanceItems={maintenanceItems}
        history={history}
        inventoryItems={inventoryItems}
      />
    </main>
  )
}
