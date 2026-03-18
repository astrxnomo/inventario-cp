import { CabinetGrid } from "@/components/cabinets/cabinet-grid"
import { PendingAccessScreen } from "@/components/cabinets/pending-access-screen"
import { AppNav } from "@/components/layout/app-nav"
import { getCabinetsWithCounts } from "@/lib/data/cabinets/get-cabinets"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { redirect } from "next/navigation"

export default async function CabinetsPage() {
  const current = await getCurrentUser()
  if (!current) redirect("/login")

  const { user, profile } = current

  if (!profile || profile.role === "pending") {
    return (
      <PendingAccessScreen
        userEmail={user.email}
        userName={profile?.full_name}
      />
    )
  }

  const supabase = await createClient()
  const cabinets = await getCabinetsWithCounts(supabase)

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav
        userEmail={user.email}
        userRole={profile.role}
        userName={profile.full_name}
      />

      <main id="main-content" className="pb-8">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-5 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Gabinetes
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {cabinets.length === 0
              ? "No hay gabinetes registrados aún."
              : `${cabinets.length} gabinete${cabinets.length !== 1 ? "s" : ""} en el sistema`}
          </p>
        </div>

        <div className="mx-auto max-w-7xl">
          <CabinetGrid initialCabinets={cabinets} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
