"use client"

import { subscribeCabinetsGrid } from "@/lib/realtime/cabinets"
import type { Cabinet, CabinetRow } from "@/lib/types/cabinets"
import { useEffect, useState } from "react"

export function useCabinets(initialCabinets: Cabinet[], userId: string) {
  const [cabinets, setCabinets] = useState<Cabinet[]>(initialCabinets)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeCabinetsGrid(userId, {
      onCabinetInsert(row: CabinetRow) {
        setCabinets((prev) => [
          ...prev,
          {
            ...row,
            _count: {
              inventory_items: 0,
              active_sessions: 0,
              my_active_sessions: 0,
            },
            item_names: [],
          },
        ])
      },

      onCabinetUpdate(id: string, changes: Partial<CabinetRow>) {
        setCabinets((prev) =>
          prev.map((c) => (c.id === id ? { ...c, ...changes } : c)),
        )
      },

      onCabinetDelete(id: string) {
        setCabinets((prev) => prev.filter((c) => c.id !== id))
      },

      onSessionChanged(
        cabinetId: string,
        delta: 1 | -1,
        isCurrentUserSession: boolean,
      ) {
        setCabinets((prev) =>
          prev.map((c) => {
            if (c.id !== cabinetId) return c
            const activeSessions = Math.max(0, c._count.active_sessions + delta)
            const myActiveSessions = isCurrentUserSession
              ? Math.max(0, c._count.my_active_sessions + delta)
              : c._count.my_active_sessions
            return {
              ...c,
              status:
                c.status !== "locked"
                  ? activeSessions > 0
                    ? "in_use"
                    : "available"
                  : "locked",
              _count: {
                ...c._count,
                active_sessions: activeSessions,
                my_active_sessions: myActiveSessions,
              },
            }
          }),
        )
      },

      onInventoryInsert(cabinetId: string, itemName: string) {
        setCabinets((prev) =>
          prev.map((c) =>
            c.id === cabinetId
              ? {
                  ...c,
                  item_names: [...c.item_names, itemName].sort(),
                  _count: {
                    ...c._count,
                    inventory_items: c._count.inventory_items + 1,
                  },
                }
              : c,
          ),
        )
      },

      onInventoryDelete(cabinetId: string, itemName: string) {
        setCabinets((prev) =>
          prev.map((c) => {
            if (c.id !== cabinetId) return c
            const idx = c.item_names.indexOf(itemName)
            const item_names =
              idx === -1
                ? c.item_names
                : [
                    ...c.item_names.slice(0, idx),
                    ...c.item_names.slice(idx + 1),
                  ]
            return {
              ...c,
              item_names,
              _count: {
                ...c._count,
                inventory_items: Math.max(0, c._count.inventory_items - 1),
              },
            }
          }),
        )
      },

      onConnected(connected: boolean) {
        setIsConnected(connected)
      },
    })

    return unsubscribe
  }, [userId])

  return { cabinets, isConnected }
}
