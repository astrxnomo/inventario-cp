"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { signOut } from "@/lib/actions/auth/sign-out"
import { Clock, LogOut, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

interface PendingAccessScreenProps {
  userEmail?: string
  userName?: string | null
}

export function PendingAccessScreen({
  userEmail,
  userName,
}: PendingAccessScreenProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-7 w-7 text-primary" />
          </div>
          <CardTitle>Cuenta pendiente de autorización</CardTitle>
          <CardDescription>
            {userName ? (
              <>
                Hola{" "}
                <span className="font-medium text-foreground">{userName}</span>,
                tu cuenta
              </>
            ) : (
              "Tu cuenta"
            )}{" "}
            ha sido registrada correctamente pero necesita ser autorizada por un
            administrador antes de poder acceder al sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userEmail && (
            <p className="text-center text-sm text-muted-foreground">
              Cuenta:{" "}
              <span className="font-medium text-foreground">{userEmail}</span>
            </p>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Una vez que un administrador apruebe tu acceso, podrás usar los
            gabinetes normalmente.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full"
              disabled={pending}
              onClick={() => startTransition(() => router.refresh())}
            >
              <RefreshCw className="size-4" />
              Verificar acceso
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signOut()}
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
