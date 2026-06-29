import type { PersonStats } from "euroleague-api"

import { num } from "@/lib/mappers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/app/query-error"

interface Props {
  stats: PersonStats | undefined
  isPending: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
}

export function PlayerSeasonStats({ stats, isPending, isError, error, onRetry }: Props) {
  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    )
  }
  if (isError) return <QueryError error={error} onRetry={onRetry} />
  if (!stats?.accumulated) {
    return <p className="text-sm text-muted-foreground">No season stats available.</p>
  }

  const acc = stats.accumulated as Record<string, unknown>
  const avg = stats.averagePerGame as Record<string, unknown> | undefined
  const gp = num(acc.gamesPlayed)
  const mpg = gp > 0 ? num(acc.timePlayed) / gp / 60 : 0

  const items = [
    { label: "GP", value: gp, sub: null },
    { label: "MPG", value: mpg.toFixed(1), sub: null },
    { label: "PTS", value: num(acc.points), sub: avg ? `${num(avg.points).toFixed(1)} avg` : null },
    { label: "REB", value: num(acc.totalRebounds), sub: avg ? `${num(avg.totalRebounds).toFixed(1)} avg` : null },
    { label: "AST", value: num(acc.assistances), sub: avg ? `${num(avg.assistances).toFixed(1)} avg` : null },
    { label: "PIR", value: num(acc.valuation), sub: avg ? `${num(avg.valuation).toFixed(1)} avg` : null },
  ]

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium">Season totals</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <Card key={item.label} className="py-3">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-1">
              <p className="text-xl font-semibold tabular-nums">{item.value}</p>
              {item.sub ? <p className="text-[10px] text-muted-foreground">{item.sub}</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
