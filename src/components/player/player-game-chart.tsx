import { useMemo } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import type { PersonStats } from "euroleague-api"

import { num } from "@/lib/mappers"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  stats: PersonStats | undefined
  isPending: boolean
}

const chartConfig = {
  points: { label: "Points", color: "var(--chart-1)" },
  pir: { label: "PIR", color: "var(--chart-2)" },
} satisfies ChartConfig

export function PlayerGameChart({ stats, isPending }: Props) {
  const chartData = useMemo(() => {
    if (!stats?.games.length) return []
    return [...stats.games]
      .filter((g) => g.game.played)
      .sort((a, b) => a.game.round - b.game.round)
      .map((entry) => {
        const line = entry.stats as Record<string, unknown>
        const { game, playerClubCode } = entry
        const opponent =
          playerClubCode === game.local.club.code
            ? game.road.club.code
            : game.local.club.code
        return {
          round: `R${game.round}`,
          points: num(line.points),
          pir: num(line.valuation),
          opponent,
        }
      })
  }, [stats])

  if (isPending) return <Skeleton className="h-56 w-full rounded-xl" />
  if (chartData.length === 0) {
    return <p className="text-sm text-muted-foreground">No per-game data to chart yet.</p>
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium">Per-game trend</h2>
      <ChartContainer config={chartConfig} className="aspect-[2/1] min-h-[220px] w-full">
        <LineChart data={chartData} margin={{ left: 8, right: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="round" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={28} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="points"
            stroke="var(--color-points)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="pir"
            stroke="var(--color-pir)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </section>
  )
}
