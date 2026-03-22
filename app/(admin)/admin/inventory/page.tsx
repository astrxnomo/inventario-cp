import { InventoryItemsTable } from "@/components/admin/inventory-items-table"
import { RefreshButton } from "@/components/ui/refresh-button"
import { getInventoryItems } from "@/lib/data/inventory/get-inventory-items"
import { createClient } from "@/lib/supabase/server"

export default async function AdminInventoryPage() {
  const supabase = await createClient()
  const items = await getInventoryItems(supabase)

  return (
    <main id="main-content" className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Inventario
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length === 0
              ? "No hay items en el inventario aún."
              : `${items.length} item${items.length !== 1 ? "s" : ""} registrados`}
          </p>
        </div>
        <RefreshButton />
      </div>

      <InventoryItemsTable items={items} />
    </main>
  )
}
