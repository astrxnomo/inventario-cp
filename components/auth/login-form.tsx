"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "@/lib/actions/auth/login"
import type { AuthState } from "@/lib/actions/auth/shared"
import Link from "next/link"
import { useActionState, useState } from "react"
import { SubmitButton } from "../ui/submit-button"

const initialState: AuthState = {}

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialState)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <Card className="w-full max-w-sm">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {state.fieldErrors?.email && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link
                href="/reset-password"
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {state.fieldErrors?.password && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.password}
              </p>
            )}
          </div>

          <SubmitButton pendingText="Ingresando…">Iniciar sesión</SubmitButton>
        </form>
      </CardContent>
    </Card>
  )
}
