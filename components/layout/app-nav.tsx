import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"

import { UserMenu } from "./user-menu"
import { CentroLogo } from "../ui/centro-logo"

interface AppNavProps {
  userEmail?: string
  userRole?: string
  userName?: string | null
}

export function AppNav({ userEmail, userRole, userName }: AppNavProps) {
  return (
    <header className="safe-area-top relative z-20 px-3 pb-2 sm:px-5">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-2xl px-4 sm:px-5">
        <Link href="/" className="group flex items-center gap-2.5">
          <CentroLogo className="size-40" />
        </Link>
        <div className="flex items-center gap-2">
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
