"use server"

import { assertAdmin } from "@/lib/actions/shared"

import { openCabinetWithMqtt } from "./open-with-mqtt"

const DEFAULT_MQTT_TOPIC = "centro/a1"

interface OpenCabinetAdminPayload {
  cabinetId: string
  cabinetLocation?: string | null
}

export async function openCabinetAsAdmin(
  payload: OpenCabinetAdminPayload,
): Promise<{ error?: string }> {
  if (!payload.cabinetLocation?.trim()) {
    return { error: "Este gabinete no tiene ubicación configurada" }
  }

  try {
    await assertAdmin()

    await openCabinetWithMqtt(process.env.HIVEMQTT_TOPIC ?? DEFAULT_MQTT_TOPIC, {
      id: payload.cabinetLocation,
      cabinetId: payload.cabinetId,
      source: "admin_quick_open",
    })

    return {}
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al abrir gabinete"
    return { error: message }
  }
}
