"use server"

import { withdrawSchema } from "@/lib/schemas/cabinets"
import { createClient } from "@/lib/supabase/server"
import type { ActionResult, WithdrawPayload } from "@/lib/types/cabinets"

function normalizeWithdrawError(error: {
  code?: string
  message?: string
  details?: string
}): string {
  const message = (error.message ?? "").toLowerCase()

  if (message.includes("insufficient") || message.includes("stock")) {
    return "No hay stock suficiente para completar el retiro"
  }

  if (message.includes("permission") || message.includes("not authorized")) {
    return "No tienes permisos para retirar artículos"
  }

  if (message.includes("cabinet") && message.includes("locked")) {
    return "El gabinete está bloqueado y no puede abrirse en este momento"
  }

  if (message.includes("session") && message.includes("active")) {
    return "Ya tienes una sesión activa para este gabinete"
  }

  if (error.code?.startsWith("PGRST")) {
    return "No se pudo guardar el retiro por un error de la API"
  }

  return error.message || "Error al retirar artículos"
}

export async function withdrawCabinetItems(
  payload: WithdrawPayload,
): Promise<ActionResult<string>> {
  const parsed = withdrawSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      data: null,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    }
  }

  const input = parsed.data

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: "No autenticado" }
    }

    if (user.id !== input.userId) {
      return {
        data: null,
        error: "No autorizado para retirar en nombre de otro usuario",
      }
    }

    if (!input.cabinetLocation) {
      return {
        data: null,
        error: "La ubicación del gabinete es requerida para abrirlo",
      }
    }

    // const cabinetOpened = await openCabinetWithMqtt("centro/a1", {
    //   id: input.cabinetLocation,
    // })

    // if (!cabinetOpened) {
    //   return { data: null, error: "Error al abrir el gabinete" }
    // }

    const { data, error } = await supabase.rpc("withdraw_items", {
      p_cabinet_id: input.cabinetId,
      p_user_id: input.userId,
      p_items: input.items,
    })

    if (error) {
      return {
        data: null,
        error: normalizeWithdrawError({
          code: error.code,
          message: error.message,
          details: error.details,
        }),
      }
    }

    if (!data) {
      return {
        data: null,
        error: "No se recibió confirmación del retiro desde la base de datos",
      }
    }

    return { data, error: null }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        data: null,
        error:
          error.message || "Ocurrió un error inesperado al retirar artículos",
      }
    }

    return {
      data: null,
      error: "Ocurrió un error inesperado al retirar artículos",
    }
  }
}
