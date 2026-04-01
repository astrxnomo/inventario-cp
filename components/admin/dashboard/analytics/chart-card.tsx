import type { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ChartCardProps = {
  title: string
  description: string
  children: ReactNode
  className?: string
  contentClassName?: string
}

type EmptyChartStateProps = {
  message: string
  className?: string
}

export function ChartCard({
  title,
  description,
  children,
  className,
  contentClassName = "pt-6",
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  )
}

export function EmptyChartState({
  message,
  className = "h-[300px]",
}: EmptyChartStateProps) {
  return (
    <div
      className={`flex ${className} items-center justify-center text-sm text-muted-foreground`}
    >
      {message}
    </div>
  )
}
