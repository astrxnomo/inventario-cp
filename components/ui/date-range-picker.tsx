"use client"

import { formatDate, cn, es } from "@/lib/utils"
import { CalendarIcon, X } from "lucide-react"
import * as React from "react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  /** ISO "YYYY-MM-DD" string or empty string */
  from: string
  /** ISO "YYYY-MM-DD" string or empty string */
  to: string
  onChange: (from: string, to: string) => void
  className?: string
}

export function DateRangePicker({
  from,
  to,
  onChange,
  className,
}: DateRangePickerProps) {
  // Convert ISO strings → Date objects for DayPicker
  const range: DateRange | undefined =
    from || to
      ? {
          from: from ? new Date(`${from}T00:00:00`) : undefined,
          to: to ? new Date(`${to}T00:00:00`) : undefined,
        }
      : undefined

  function handleSelect(r: DateRange | undefined) {
    onChange(
      r?.from ? formatDate(r.from, "yyyy-MM-dd") : "",
      r?.to ? formatDate(r.to, "yyyy-MM-dd") : "",
    )
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange("", "")
  }

  const hasRange = from || to
  const label = range?.from
    ? range.to
      ? `${formatDate(range.from, "d MMM")} – ${formatDate(range.to, "d MMM yyyy")}`
      : formatDate(range.from, "d MMM yyyy")
    : "Rango de fechas"

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8 gap-1.5 px-3 text-xs font-normal",
            !hasRange && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
          <span>{label}</span>
          {hasRange && (
            <span
              role="button"
              aria-label="Limpiar fechas"
              className="ml-1 rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          locale={es}
          numberOfMonths={1}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
