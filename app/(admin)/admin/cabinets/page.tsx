import { CabinetGrid } from "@/components/cabinets/cabinet-grid"
import { RefreshButton } from "@/components/ui/refresh-button"
import { getCabinetsWithCounts } from "@/lib/data/cabinets/get-cabinets"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminCabinetsPage() {
  const current = await getCurrentUser()
  if (!current) redirect("/login")

  const supabase = await createClient()
  const cabinets = await getCabinetsWithCounts(supabase)

  return (
    <main id="main-content" className="w-full px-4 py-6 lg:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gabinetes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {cabinets.length} gabinete{cabinets.length !== 1 ? "s" : ""} en el
            sistema
          </p>
        </div>
        <RefreshButton />
      </div>

      <div className="mx-auto">
        <CabinetGrid initialCabinets={cabinets} userId={current.user.id} />
      </div>
    </main>
  )
}
