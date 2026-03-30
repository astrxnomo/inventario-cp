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
    <>
      <header className="sticky z-10 w-full border-border bg-background/80 backdrop-blur-sm md:pt-5 standalone:fixed">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-2 standalone:mt-10 md:standalone:mt-2">
          <Link href="/" className="group flex items-center gap-2.5">
            <CentroLogo className="h-auto w-24 max-w-full sm:w-32 md:w-40" />
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
      <div className="h-0 standalone:h-30" />
    </>
  )
}
