import { CategoryForm } from "@/components/admin/categories/form"
import { getCategoryById } from "@/lib/data/categories/get-categories"
import { notFound } from "next/navigation"

interface EditCategoryPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditCategoryPage(props: EditCategoryPageProps) {
  const params = await props.params
  const category = await getCategoryById(params.id)

  if (!category) {
    notFound()
  }

  return (
    <main className="w-full max-w-2xl px-4 py-6 lg:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Editar Categoría
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Modifica los detalles de la categoría.
        </p>
      </div>
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <CategoryForm initialData={category} />
      </div>
    </main>
  )
}
