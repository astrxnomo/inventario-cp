"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPasswordAction } from "@/lib/actions/auth/reset-password"
import type { AuthState } from "@/lib/actions/auth/shared"
import Link from "next/link"
import { useActionState } from "react"
import { SubmitButton } from "../ui/submit-button"

const initialState: AuthState = {}

export function ResetPasswordForm() {
  const [state, action] = useActionState(resetPasswordAction, initialState)

  if (state.success) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Revisa tu email</CardTitle>
          <CardDescription>
            Enviamos un link a{" "}
            <span className="font-medium text-foreground">
              {state.successEmail}
            </span>
            . Úsalo para crear una nueva contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/reset-password">
            <Button variant="outline" className="w-full">
              Usar otro email
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Recuperar contraseña</CardTitle>
        <CardDescription>
          Te enviaremos un link para restablecer tu contraseña.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          {state.error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              autoFocus
            />
            {state.fieldErrors?.email && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.email}
              </p>
            )}
          </div>

          <SubmitButton pendingText="Enviando…">
            Enviar email de recuperación
          </SubmitButton>

          <p className="text-center text-sm">
            <Link
              href="/login"
              className="text-muted-foreground underline-offset-4 hover:underline"
            >
              ← Volver al login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
