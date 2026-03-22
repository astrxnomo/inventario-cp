"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import { UserMenu } from "@/components/layout/user-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  ActivitySquare,
  Calendar,
  History,
  LayoutDashboard,
  Package,
  PackageOpen,
  Shield,
  Users,
} from "lucide-react"

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/cabinets", label: "Gabinetes", icon: Package },
  { href: "/admin/inventory", label: "Inventario", icon: PackageOpen },
  { href: "/admin/users", label: "Usuarios", icon: Users },
]

const logsLinks = [
  { href: "/admin/reservations", label: "Reservas", icon: Calendar },
  { href: "/admin/sessions", label: "Sesiones", icon: History },
  { href: "/admin/activity", label: "Actividad", icon: ActivitySquare },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userEmail?: string
  userRole?: string
  userName?: string | null
}

export function AppSidebar({
  userEmail,
  userRole,
  userName,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="px-3 pt-3 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-auto rounded-xl border border-sidebar-border/70 bg-sidebar-accent/40 p-2.5 transition-colors hover:bg-sidebar-accent"
            >
              <Link href="/admin/dashboard">
                <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Shield className="size-4" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-[11px] font-medium text-sidebar-foreground/70">
                    Inventario Inteligente
                  </span>
                  <span className="text-sm font-semibold">Panel Admin</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="mt-2" />
      </SidebarHeader>

      <SidebarContent className="px-3 pb-2">
        <p className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-sidebar-foreground/60 uppercase">
          Navegacion
        </p>
        <SidebarMenu className="gap-1">
          {adminLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname.startsWith(link.href)

            return (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className="h-10 rounded-xl px-2.5 data-[active=true]:bg-sidebar-primary/12 data-[active=true]:text-sidebar-primary"
                >
                  <Link href={link.href}>
                    <span className="flex size-7 items-center justify-center rounded-md bg-sidebar-accent/60 group-data-[active=true]/menu-button:bg-sidebar-primary/16">
                      <Icon className="size-4" />
                    </span>
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>

        <SidebarSeparator className="my-3" />

        <p className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-sidebar-foreground/60 uppercase">
          Logs
        </p>
        <SidebarMenu className="gap-1">
          {logsLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname.startsWith(link.href)

            return (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className="h-10 rounded-xl px-2.5 data-[active=true]:bg-sidebar-primary/12 data-[active=true]:text-sidebar-primary"
                >
                  <Link href={link.href}>
                    <span className="flex size-7 items-center justify-center rounded-md bg-sidebar-accent/60 group-data-[active=true]/menu-button:bg-sidebar-primary/16">
                      <Icon className="size-4" />
                    </span>
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-3 pt-2 pb-3">
        <SidebarSeparator className="mb-2" />
        <UserMenu
          userEmail={userEmail}
          userRole={userRole}
          userName={userName}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
