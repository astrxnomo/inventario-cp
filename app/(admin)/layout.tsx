import { AdminSubNav } from "@/components/admin/admin-sub-nav"
import { AppNav } from "@/components/layout/app-nav"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const current = await getCurrentUser()

  if (!current) redirect("/login")
  if (!current.profile || !["admin", "root"].includes(current.profile.role)) {
    redirect("/cabinets")
  }

  const { user, profile } = current

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav
        userEmail={user.email}
        userRole={profile.role}
        userName={profile.full_name}
      />
      <AdminSubNav />
      {children}
    </div>
  )
}
