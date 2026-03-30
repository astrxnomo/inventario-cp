import { CentroLogo } from "@/components/ui/centro-logo"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-start p-6 pt-32">
      <Link href="/">
        <span className="sr-only">Inventario Inteligente</span>
        <CentroLogo className="w-70 max-w-full" />
      </Link>
      <div className="mt-8 flex w-full flex-col items-center">{children}</div>
    </main>
  )
}
