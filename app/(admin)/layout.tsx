import { AppSidebar } from "@/components/layout/app-sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getAdminSidebarCounts } from "@/lib/data/dashboard/get-admin-sidebar-counts"
import { getPendingUsersCount } from "@/lib/data/users/get-pending-users-count"
import { getCurrentUser } from "@/lib/supabase/get-current-user"
import { redirect } from "next/navigation"
import { ChatbotBubble } from "@/components/layout/chatbot-bubble"

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
  const [pendingUsersCount, sidebarCounts] = await Promise.all([
    getPendingUsersCount(),
    getAdminSidebarCounts(),
  ])

  return (
    <SidebarProvider>
      <AppSidebar
        variant="sidebar"
        user={profile}
        pendingUsersCount={pendingUsersCount}
        maintenanceAttentionCount={sidebarCounts.maintenanceAttention}
        activeSessionsCount={sidebarCounts.activeSessions}
        activeReservationsCount={sidebarCounts.activeReservations}
      />
      <SidebarInset className="">
        <header className="sticky z-10 w-full border-b bg-background/80 backdrop-blur-sm standalone:fixed">
          <div className="flex h-14 items-center justify-between px-4 standalone:mt-8 md:standalone:mt-0">
            <SidebarTrigger />
            <ThemeToggle />
          </div>
        </header>
        <div className="h-0 standalone:h-20" />
        {children}
        <ChatbotBubble />
      </SidebarInset>
    </SidebarProvider>
  )
}
