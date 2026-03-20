import { ItemsTable } from "@/components/admin/items-table"
import { Button } from "@/components/ui/button"
import { RefreshButton } from "@/components/ui/refresh-button"
import { getCabinetItemsAdmin } from "@/lib/data/cabinets/get-cabinets-admin"
import { getCategories } from "@/lib/data/categories/get-categories"
import { createClient } from "@/lib/supabase/server"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminCabinetDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cabinet } = await supabase
    .from("cabinets")
    .select("id, name, location")
    .eq("id", id)
    .single()

  if (!cabinet) notFound()

  const [items, categories] = await Promise.all([
    getCabinetItemsAdmin(supabase, id),
    getCategories(supabase),
  ])

  return (
    <main id="main-content" className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href="/admin/cabinets">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Gabinetes
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {cabinet.name}
          </h1>
          {cabinet.location && (
            <p className="mt-1 text-sm text-muted-foreground">
              {cabinet.location}
            </p>
          )}
          <p className="mt-0.5 text-sm text-muted-foreground">
            {items.length} artículo{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <RefreshButton />
      </div>

      <ItemsTable cabinetId={id} items={items} categories={categories} />
    </main>
  )
}
