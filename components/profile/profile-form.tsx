"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/ui/submit-button"
import type { AuthState } from "@/lib/actions/auth/shared"
import { updatePasswordAction } from "@/lib/actions/auth/update-password"
import { updateProfileAction } from "@/lib/actions/auth/update-profile"
import { CheckCircle2 } from "lucide-react"
import { useActionState } from "react"

const initialState: AuthState = {}

export function ProfileForm({ currentName }: { currentName: string | null }) {
  const [profileState, profileAction] = useActionState(
    updateProfileAction,
    initialState,
  )
  const [passwordState, passwordAction] = useActionState(
    updatePasswordAction,
    initialState,
  )

  return (
    <div className="space-y-6">
      {/* ── Profile name ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del perfil</CardTitle>
          <CardDescription>
            Actualiza tu nombre visible en la app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="space-y-4">
            {profileState.error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {profileState.error}
              </p>
            )}
            {profileState.success && (
              <p className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Perfil actualizado
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                defaultValue={currentName ?? ""}
                placeholder="Tu nombre"
              />
            </div>
            <SubmitButton pendingText="Guardando…">Guardar nombre</SubmitButton>
          </form>
        </CardContent>
      </Card>

      {/* ── Password ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cambiar contraseña</CardTitle>
          <CardDescription>
            Elige una contraseña nueva de al menos 6 caracteres.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={passwordAction} className="space-y-4">
            {passwordState.error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {passwordState.error}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
              />
              {passwordState.fieldErrors?.password && (
                <p className="text-xs text-destructive">
                  {passwordState.fieldErrors.password}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
              />
              {passwordState.fieldErrors?.confirm && (
                <p className="text-xs text-destructive">
                  {passwordState.fieldErrors.confirm}
                </p>
              )}
            </div>
            <SubmitButton pendingText="Actualizando…">
              Cambiar contraseña
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
