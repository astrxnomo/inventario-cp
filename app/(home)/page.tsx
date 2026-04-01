import { CabinetGrid } from "@/components/cabinets/cabinet-grid"
import { PendingAccessScreen } from "@/components/cabinets/pending-access-screen"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/actions/auth/sign-out"
import { AppNav } from "@/components/layout/app-nav"
import { getCabinetsWithCounts } from "@/lib/data/cabinets/get-cabinets"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { Ban, LogOut } from "lucide-react"
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
  if (profile.role === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <Ban className="text-destructive-500 h-7 w-7" />
            </div>
            <CardTitle>Cuenta restringida</CardTitle>
            <CardDescription>
              Tu cuenta fue restringida por un administrador y no tiene acceso
              al sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Cuenta:{" "}
              <span className="font-medium text-foreground">{user.email}</span>
            </p>
            <form action={signOut}>
              <Button variant="outline" className="w-full">
                <LogOut className="size-4" />
                Cerrar sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
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
