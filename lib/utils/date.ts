import { format as dateFnsFormat, type FormatOptions } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import { es } from "date-fns/locale"

const TIMEZONE = "America/Bogota"

export function formatDate(
  date: Date | number | string | null | undefined,
  formatStr: string = "PPP p", // Default includes time now as requested: "Pp" or "PPP p"
  options?: FormatOptions,
) {
  if (!date) return ""
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return ""

  try {
    // formatInTimeZone handles the timezone conversion
    return formatInTimeZone(dateObj, TIMEZONE, formatStr, {
      locale: es as any,
      ...options,
    })
  } catch (error) {
    console.error("Error formatting date in timezone:", error)
    // Fallback to local time if timezone fails
    return dateFnsFormat(dateObj, formatStr, { locale: es as any, ...options })
  }
}

export * from "date-fns"
export { es }
