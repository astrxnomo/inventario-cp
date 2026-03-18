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
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Gestión de gabinetes
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {cabinets.length} gabinete{cabinets.length !== 1 ? "s" : ""}{" "}
            registrado{cabinets.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CategoryManager categories={categories} />
          <RefreshButton />
        </div>
      </div>

      <CabinetsTable cabinets={cabinets} />
    </main>
  )
}
