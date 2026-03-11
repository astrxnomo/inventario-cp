"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { signOut } from "@/lib/actions/auth/sign-out"

import { LogOut, User } from "lucide-react"

import { Button } from "../ui/button"

export function UserMenu({ userEmail }: { userEmail?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center gap-1">
          <User />
          <span>{userEmail?.split("@")[0]}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="py-2.5 font-normal">
          <div className="flex items-center gap-3">
            <Button size="icon">
              <User />
            </Button>
            <div className="flex min-w-0 flex-col">
              {userEmail && (
                <span className="truncate text-sm text-muted-foreground">
                  {userEmail}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-2 text-destructive hover:bg-destructive/5 focus:text-destructive"
          onSelect={() => signOut()}
        >
          <LogOut className="hover:text-destructive" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
