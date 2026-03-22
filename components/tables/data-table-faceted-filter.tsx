"use client"

import type { Column } from "@tanstack/react-table"
import { CheckIcon, TableProperties } from "lucide-react"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  /**
   * Optional filter values to force re-render when the column instance is stable
   * but internal state changes
   */
  filterValues?: string[]
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  filterValues,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues()
  const selectedValues = new Set(
    (filterValues ?? column?.getFilterValue()) as string[],
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <TableProperties />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} seleccionados
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value)
                      } else {
                        selectedValues.add(option.value)
                      }
                      const filterValues = Array.from(selectedValues)
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined,
                      )
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <CheckIcon className={cn("size-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-1 size-4 text-muted-foreground" />
                    )}
                    <div className="flex flex-1 items-center justify-between">
                      <span>{option.label}</span>
                      {facets?.get(option.value) && (
                        <div className="flex items-center">
                          <Badge
                            variant="secondary"
                            className="rounded-sm px-1 font-normal"
                          >
                            {facets.get(option.value)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Limpiar filtros
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
