import { AppNav } from "@/components/layout/app-nav"
import { ProfileForm } from "@/components/profile/profile-form"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const current = await getCurrentUser()
  if (!current) redirect("/login")

  const { user, profile } = current

  if (!profile || profile.role === "pending") redirect("/cabinets")

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav
        userEmail={user.email}
        userRole={profile.role}
        userName={profile.full_name}
      />

      <main id="main-content" className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Mi perfil
          </h1>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
        </div>

        <ProfileForm currentName={profile.full_name} />
      </main>
    </div>
  )
}
