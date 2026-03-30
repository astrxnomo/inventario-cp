"use client"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

export default function AuthTabs() {
  const [tab, setTab] = useState<"login" | "register">("login")

  return (
    <div>
      <div className="flex items-center justify-center">
        <div
          role="tablist"
          aria-label="Auth tabs"
          className="inline-flex rounded-xl bg-muted p-1"
        >
          <button
            role="tab"
            aria-selected={tab === "login"}
            onClick={() => setTab("login")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === "login" ? "bg-card shadow" : "text-muted-foreground"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            role="tab"
            aria-selected={tab === "register"}
            onClick={() => setTab("register")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              tab === "register" ? "bg-card shadow" : "text-muted-foreground"
            }`}
          >
            Registrarse
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        {tab === "login" ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  )
}
