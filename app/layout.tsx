import { Geist, Geist_Mono } from "next/font/google"

import { ThemeProvider } from "@/components/providers/theme-provider"
import { ChatbotBubble } from "@/components/layout/chatbot-bubble"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import "./globals.css"
import { Metadata, Viewport } from "next"

const geistHeading = Geist({ subsets: ["latin"], variable: "--font-heading" })

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Inventario - Centro de Prototipado ",
  description: "Sistema de gestión de inventario para el Centro de Prototipado",
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable,
        geistHeading.variable,
      )}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="Centro Prototipado" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <ChatbotBubble />
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
