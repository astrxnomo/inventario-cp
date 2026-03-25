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
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Inventario Inteligente
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button asChild variant="outline">
              <Link href="/admin/users">
                <Shield />
                Admin
              </Link>
            </Button>
          )}
          <UserMenu
            userEmail={userEmail}
            userRole={userRole}
            userName={userName}
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
