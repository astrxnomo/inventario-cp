"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

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
  Archive,
  ArrowLeft,
  Box,
  Calendar,
  History,
  Shield,
  Tags,
  Users,
  Wrench,
} from "lucide-react"
import { NavUser } from "./nav-user"
import { Profile } from "@/lib/types/users"

const adminLinks = [{ href: "/admin/users", label: "Usuarios", icon: Users }]

const inventoryLinks = [
  { href: "/admin/inventory", label: "Objetos", icon: Box },
  { href: "/admin/cabinets", label: "Gabinetes", icon: Archive },
  { href: "/admin/categories", label: "Categorías", icon: Tags },
  { href: "/admin/maintenance", label: "Mantenimiento", icon: Wrench },
]

const logsLinks = [
  { href: "/admin/activity", label: "Actividad", icon: ActivitySquare },
  { href: "/admin/sessions", label: "Sesiones", icon: History },
  { href: "/admin/reservations", label: "Reservas", icon: Calendar },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: Profile
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
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
                  <span className="text-sm font-semibold">Administración</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="mt-5 flex flex-col justify-between gap-6 px-3 pb-2">
        <div>
          <SidebarMenu className="gap-1">
            <p className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-sidebar-foreground/60 uppercase">
              Gestión
            </p>
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

          {inventoryLinks.length > 0 && (
            <>
              <p className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-sidebar-foreground/60 uppercase">
                Inventario
              </p>
              <SidebarMenu className="gap-1">
                {inventoryLinks.map((link) => {
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
            </>
          )}

          <SidebarSeparator className="my-3" />

          <p className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-sidebar-foreground/60 uppercase">
            Registros
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

          <SidebarSeparator className="my-3" />
        </div>

        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-10 rounded-xl px-2.5 data-[active=true]:bg-sidebar-primary/12 data-[active=true]:text-sidebar-primary"
            >
              <Link href="/">
                <span className="flex size-7 items-center justify-center rounded-md bg-sidebar-accent/60 group-data-[active=true]/menu-button:bg-sidebar-primary/16">
                  <ArrowLeft className="size-4" />
                </span>
                <span>Volver a los gabinetes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
