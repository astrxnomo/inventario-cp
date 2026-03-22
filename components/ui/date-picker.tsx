"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn, es, formatDate } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"

import * as React from "react"

export interface DatePickerProps {
  value?: Date | null
  onChange?: (date?: Date | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Fecha",
  className,
  disabled,
}: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    value || undefined,
  )

  // Controlled if value is provided (even if null)
  const isControlled = value !== undefined
  const date = isControlled ? value || undefined : internalDate

  const handleSelect = (newDate: Date | undefined) => {
    if (!isControlled) {
      setInternalDate(newDate)
    }
    if (onChange) {
      onChange(newDate || null)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-between border-dashed text-left font-normal",
            !date && "text-foreground",
            className,
          )}
          disabled={disabled}
        >
          <CalendarIcon />
          {date ? formatDate(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          locale={es}
        />
      </PopoverContent>
    </Popover>
  )
}
