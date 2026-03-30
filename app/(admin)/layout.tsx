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

  if (!current) redirect("/auth")
  if (!current.profile || !["admin", "root"].includes(current.profile.role)) {
    redirect("/")
  }

  const { profile } = current

  return (
    <SidebarProvider>
      <AppSidebar variant="sidebar" user={profile} />
      <SidebarInset className="">
        <header className="sticky z-10 w-full border-b bg-background/80 backdrop-blur-sm standalone:fixed">
          <div className="mx-auto flex h-14 w-full items-center justify-between gap-2 px-4 standalone:mt-8">
            <SidebarTrigger />

            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="h-0 standalone:h-20" />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
