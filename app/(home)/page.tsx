import { CabinetGrid } from "@/components/cabinets/cabinet-grid"
import { PendingAccessScreen } from "@/components/cabinets/pending-access-screen"
import { AppNav } from "@/components/layout/app-nav"
import { getCabinetsWithCounts } from "@/lib/data/cabinets/get-cabinets"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const current = await getCurrentUser()
  if (!current) redirect("/auth")

  const { user, profile } = current

  if (!profile || profile.role === "pending") {
    return (
      <PendingAccessScreen
        userEmail={user.email}
        userName={profile?.full_name}
      />
    )
  }

  const cabinets = await getCabinetsWithCounts()

  return (
    <div className="min-h-screen bg-background">
      <AppNav
        userEmail={user.email}
        userRole={profile.role}
        userName={profile.full_name}
      />

      <main id="main-content" className="pt-5 md:pt-10">
        <div className="mx-auto max-w-6xl">
          <CabinetGrid initialCabinets={cabinets} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
