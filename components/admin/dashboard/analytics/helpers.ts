import type { ChartConfig } from "@/components/ui/chart"

export function shortDayLabel(value: unknown) {
  if (typeof value !== "string") return ""

  return new Date(value).toLocaleDateString("es-MX", {
    month: "short",
    day: "numeric",
  })
}

export function getPieSliceColor(
  config: ChartConfig,
  key: string,
  fallback = "#94a3b8",
) {
  return config[key]?.color ?? fallback
}
