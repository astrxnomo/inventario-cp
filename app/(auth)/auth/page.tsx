import AuthTabs from "@/components/auth/auth-tabs"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect("/")

  return (
    <section className="flex w-full justify-center px-4">
      <div className="w-full max-w-sm">
        <AuthTabs />
      </div>
    </section>
  )
}
