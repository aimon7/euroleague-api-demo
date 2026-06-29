import { InfoIcon } from "@phosphor-icons/react"

import { formatStat } from "@/lib/advanced"
import type { AdvancedStat } from "@/lib/advanced"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function AdvancedStatCard({ stat }: { stat: AdvancedStat }) {
  const sourceLabel = stat.source === "api" ? "From API" : "Calculated"

  return (
    <Card className="py-3">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 px-4 pb-1">
        <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
        <Tooltip>
          <TooltipTrigger
            className="inline-flex items-center gap-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            aria-label={`${stat.label} formula`}
          >
            <Badge variant={stat.source === "api" ? "secondary" : "outline"}>
              {sourceLabel}
            </Badge>
            <InfoIcon className="size-3.5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-left">
            <p className="font-medium">{stat.formula}</p>
            <a
              href={stat.reference}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-[10px] underline underline-offset-2"
            >
              Reference
            </a>
          </TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="px-4 pt-0">
        <p className="text-2xl font-semibold tabular-nums">{formatStat(stat)}</p>
      </CardContent>
    </Card>
  )
}
