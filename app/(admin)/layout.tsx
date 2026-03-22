import { AppSidebar } from "@/components/layout/app-sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
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
    redirect("/")
  }

  const { user, profile } = current

  return (
    <SidebarProvider>
      <AppSidebar
        variant="sidebar"
        userEmail={user.email}
        userRole={profile.role}
        userName={profile.full_name}
      />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger />
          <span className="text-sm font-medium text-muted-foreground">
            Inventario Inteligente · Admin
          </span>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
