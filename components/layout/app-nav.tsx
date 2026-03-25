import { LayoutGrid, Shield } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "../ui/button"
import { UserMenu } from "./user-menu"

interface AppNavProps {
  userEmail?: string
  userRole?: string
  userName?: string | null
}

export function AppNav({ userEmail, userRole, userName }: AppNavProps) {
  const isAdmin = userRole === "admin" || userRole === "root"

  return (
    <header className="relative z-20 px-3 pt-4 pb-2 sm:px-5 sm:pt-5">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-2xl border border-border/80 bg-card/85 px-4 shadow-md ring-1 shadow-black/5 ring-border/50 backdrop-blur-md sm:px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm transition-transform duration-300 group-hover:scale-105">
            <LayoutGrid className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-foreground lg:text-base">
            Inventario Inteligente
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <UserMenu
            userEmail={userEmail}
            userRole={userRole}
            userName={userName}
          />
          {isAdmin && (
            <Button asChild variant="outline">
              <Link href="/admin/users">
                <Shield />
                Admin
              </Link>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
