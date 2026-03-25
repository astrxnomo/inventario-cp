"use server"

import mqtt, { type MqttClient } from "mqtt"

export async function openCabinetWithMqtt(
  topic: string,
  message: Record<string, any>,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const client: MqttClient = mqtt.connect("mqtt://172.16.32.42:1883")

    client.on("connect", () => {
      console.log("Conectado al broker")

      client.publish(topic, JSON.stringify(message), {}, (err?: Error) => {
        if (err) {
          reject(err)
        } else {
          resolve("Mensaje enviado")
        }

        client.end()
      })
    })

    client.on("error", (err: Error) => {
      reject(err)
    })
  })
}
