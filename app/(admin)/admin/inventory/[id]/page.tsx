import { notFound } from "next/navigation"
import { getInventoryItem } from "@/lib/data/inventory/get-inventory-item"
import { getCategories } from "@/lib/data/categories/get-categories"
import { getCabinetsWithCounts } from "@/lib/data/cabinets/get-cabinets"
import { EditItemForm } from "@/components/admin/inventory/edit-form"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditItemPage({ params }: PageProps) {
  const { id } = await params

  const [item, categories, cabinets] = await Promise.all([
    getInventoryItem(id),
    getCategories(),
    getCabinetsWithCounts(),
  ])

  if (!item) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Editar Item</h1>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <EditItemForm item={item} categories={categories} cabinets={cabinets} />
      </div>
    </div>
  )
}
