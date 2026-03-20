import { CabinetsTable } from "@/components/admin/cabinets-table"
import { CategoryManager } from "@/components/admin/category-manager"
import { RefreshButton } from "@/components/ui/refresh-button"
import { getCabinetsAdmin } from "@/lib/data/cabinets/get-cabinets-admin"
import { getCategories } from "@/lib/data/categories/get-categories"
import { createClient } from "@/lib/supabase/server"

export default async function AdminCabinetsPage() {
  const supabase = await createClient()
  const [cabinets, categories] = await Promise.all([
    getCabinetsAdmin(supabase),
    getCategories(supabase),
  ])

  return (
    <main id="main-content" className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gestión de gabinetes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {cabinets.length} gabinete{cabinets.length !== 1 ? "s" : ""}{" "}
            registrado{cabinets.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <CategoryManager categories={categories} />
          <RefreshButton />
        </div>
      </div>

      <CabinetsTable cabinets={cabinets} />
    </main>
  )
}
