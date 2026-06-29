import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  hint?: string
  className?: string
}

/** Compact metric tile: a quiet label over a prominent value, with an optional hint. */
export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <Card size="sm" className={cn("gap-1", className)}>
      <CardContent className="flex flex-col gap-0.5">
        <span className="text-[0.625rem] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <span className="font-heading text-2xl leading-none font-semibold tabular-nums">
          {value}
        </span>
        {hint != null && hint.length > 0 ? (
          <span className="text-[0.625rem] text-muted-foreground">{hint}</span>
        ) : null}
      </CardContent>
    </Card>
  )
}
