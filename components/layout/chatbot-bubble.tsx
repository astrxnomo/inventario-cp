"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"
import Image from "next/image"

export function ChatbotBubble() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="pointer-events-none fixed right-0 bottom-0 z-50 m-5 flex flex-col items-end">
      <div
        className={cn(
          "mb-2 w-[calc(100vw-2rem)] max-w-110 overflow-hidden rounded-2xl shadow-2xl transition-all duration-300",
          isOpen
            ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible translate-y-2 scale-95 opacity-0",
        )}
        aria-hidden={!isOpen}
      >
        <iframe
          src="https://optistock-three.vercel.app/"
          className="h-[65vh] min-h-105 w-full bg-background"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="clipboard-read; clipboard-write"
        />
      </div>

      <div className="group pointer-events-auto relative">
        <span className="pointer-events-none absolute top-1/2 right-full mr-3 -translate-y-1/2 rounded-full border border-primary/35 bg-primary/95 px-3 py-1 text-xs font-semibold tracking-wide text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 group-focus-within:mr-2 group-focus-within:opacity-100 group-hover:mr-2 group-hover:opacity-100">
          Optibot
        </span>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "inline-flex size-14 items-center justify-center rounded-full border border-primary/40 bg-primary shadow-[0_12px_30px_rgba(8,145,178,0.35)] ring-1 ring-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:shadow-[0_16px_34px_rgba(8,145,178,0.45)] active:translate-y-0",
            !isOpen && "animate-[optibot-float_3.2s_ease-in-out_infinite]",
          )}
          aria-label={isOpen ? "Cerrar Optibot" : "Abrir Optibot"}
          aria-expanded={isOpen}
        >
          <Image
            src="/proto.png"
            alt="Optibot Avatar"
            width={34}
            height={34}
            className="size-10 rounded-xl object-cover"
          />
        </button>
      </div>

      <style jsx global>{`
        @keyframes optibot-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  )
}
