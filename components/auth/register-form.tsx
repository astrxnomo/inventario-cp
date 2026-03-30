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
import { registerAction } from "@/lib/actions/auth/register"
import type { AuthState } from "@/lib/actions/auth/shared"
import Link from "next/link"
import { useActionState, useState } from "react"
import { SubmitButton } from "../ui/submit-button"

const initialState: AuthState = {}

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initialState)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  if (state.success) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Revisa tu email</CardTitle>
          <CardDescription>
            Enviamos un link de confirmación a{" "}
            <span className="font-medium text-foreground">
              {state.successEmail}
            </span>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth">
            <Button variant="outline" className="w-full">
              Ir al login
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

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
            <Label htmlFor="full_name">Nombre</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="Juan Pérez"
              autoComplete="name"
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {state.fieldErrors?.full_name && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.full_name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
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
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {state.fieldErrors?.password && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.password}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirmar contraseña</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {state.fieldErrors?.confirm && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.confirm}
              </p>
            )}
          </div>

          <SubmitButton pendingText="Creando cuenta…">
            Crear cuenta
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  )
}
