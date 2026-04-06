"use server"

import mqtt, { type IClientOptions, type MqttClient } from "mqtt"

export async function openCabinetWithMqtt(
  topic: string,
  message: Record<string, unknown>,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const host = process.env.HIVEMQTT_BROKER_URL
    const username = process.env.HIVEMQTT_USERNAME
    const password = process.env.HIVEMQTT_PASSWORD

    if (!host || !username || !password) {
      reject(
        new Error(
          "Faltan variables de entorno MQTT: HIVEMQTT_BROKER_URL, HIVEMQTT_USERNAME o HIVEMQTT_PASSWORD",
        ),
      )
      return
    }

    const options: IClientOptions = {
      host,
      port: 8883,
      protocol: "mqtts",
      username,
      password,
      connectTimeout: 10_000,
    }

    const client: MqttClient = mqtt.connect(options)
    let settled = false

    const fail = (error: Error) => {
      if (settled) return
      settled = true
      reject(error)
      client.end(true)
    }

    const done = (result: string) => {
      if (settled) return
      settled = true
      resolve(result)
      client.end(false)
    }

    const timer = setTimeout(() => {
      fail(new Error("Timeout al conectar/publicar en MQTT"))
    }, 12_000)

    client.on("close", () => {
      clearTimeout(timer)
    })

    client.on("connect", () => {
      console.log("Conectado al broker")

      client.publish(topic, JSON.stringify(message), {}, (err?: Error) => {
        if (err) {
          fail(err)
        } else {
          done("Mensaje enviado")
        }
      })
    })

    client.on("error", (err: Error) => {
      fail(err)
    })
  })
}
