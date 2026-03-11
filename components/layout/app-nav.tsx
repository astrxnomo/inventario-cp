import { LayoutGrid } from "lucide-react"
import { UserMenu } from "./user-menu"

export function AppNav({ userEmail }: { userEmail?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
            <LayoutGrid className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            Inventario Inteligente
          </span>
        </div>

        <UserMenu userEmail={userEmail} />
      </div>
    </header>
  )
}
