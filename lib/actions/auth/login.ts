"use server"

import { loginSchema } from "@/lib/schemas/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { collectFieldErrors, type AuthState } from "./shared"

export async function loginAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!result.success) {
    return { fieldErrors: collectFieldErrors(result.error.issues) }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(result.data)
  if (error) {
    const m = (error.message || "").toLowerCase()
    // Map common supabase/auth errors to friendly messages
    if (
      m.includes("invalid login") ||
      m.includes("invalid password") ||
      m.includes("email or password")
    ) {
      return { error: "Email o contraseña incorrectos" }
    }
    if (m.includes("email not confirmed") || m.includes("unconfirmed")) {
      return {
        error: "Tu email no está verificado. Revisa tu bandeja de entrada.",
      }
    }
    if (m.includes("too many requests") || m.includes("rate")) {
      return { error: "Demasiados intentos. Intenta de nuevo más tarde." }
    }
    if (error.status && error.status >= 500) {
      return { error: "Error del servidor. Intenta de nuevo más tarde." }
    }

    // Fallback to the provided message when it's safe and informative
    return { error: error.message || "No se pudo iniciar sesión" }
  }

  redirect("/")
}
