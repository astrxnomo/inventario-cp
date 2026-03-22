import { InventoryItemsTable } from "@/components/admin/inventory/table"
import { getAllItems } from "@/lib/data/inventory/get-all-items"
import { createClient } from "@/lib/supabase/server"

export default async function AdminInventoryPage() {
  const supabase = await createClient()

  // Parallel fetching
  const [items, { data: categories }, { data: cabinets }] = await Promise.all([
    getAllItems(),
    supabase.from("inventory_categories").select("*"),
    supabase.from("cabinets").select("*"),
  ])

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
      </div>

      <InventoryItemsTable
        items={items}
        categories={categories || []}
        cabinets={cabinets || []}
      />
    </main>
  )
}
