import { CategoriesTable } from "@/components/admin/categories/table"
import { getAdminCategories } from "@/lib/data/categories/get-categories"

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories()

  return (
    <main className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Categorías
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length} categoría
            {categories.length !== 1 ? "s" : ""} en el sistema
          </p>
        </div>
      </div>

      <div className="mx-auto">
        <CategoriesTable data={categories} />
      </div>
    </main>
  )
}
