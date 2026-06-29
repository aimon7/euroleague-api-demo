import { InfoIcon } from "@phosphor-icons/react"

import { formatStat } from "@/lib/advanced"
import type { AdvancedStat } from "@/lib/advanced"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function AdvancedStatCard({ stat }: { stat: AdvancedStat }) {
  const fromApi = stat.source === "api"

  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
          <Tooltip>
            <TooltipTrigger
              render={<button type="button" />}
              aria-label={`How ${stat.label} is calculated`}
              className="-mt-0.5 shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
            >
              <InfoIcon className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs flex-col items-start gap-1.5">
              <span className="font-mono text-[0.7rem] leading-relaxed">{stat.formula}</span>
              <a
                href={stat.reference}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:no-underline"
              >
                Methodology ↗
              </a>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-end justify-between gap-2">
          <span className="text-2xl font-semibold tabular-nums">{formatStat(stat)}</span>
          <Badge variant={fromApi ? "secondary" : "outline"}>
            {fromApi ? "From API" : "Calculated"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
