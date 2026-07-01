import { useMemo } from "react"
import type { Competition } from "euroleague-api"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { usePersonSeasonStats } from "@/lib/hooks"
import { num } from "@/lib/mappers"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/app/query-error"

interface Props {
  competition: Competition
  personCode: string
  season: number
}

interface GamePoint {
  round: number
  label: string
  tooltipLabel: string
  points: number
  pir: number
}

const chartConfig = {
  points: { label: "Points", color: "var(--chart-2)" },
  pir: { label: "PIR", color: "var(--chart-3)" },
} satisfies ChartConfig

function gameTooltipLabel(payload: unknown): string {
  const items = payload as Array<{ payload?: GamePoint }> | undefined
  return items?.[0]?.payload?.tooltipLabel ?? ""
}

export function GameTrend({ competition, personCode, season }: Props) {
  const { data, isPending, isError, error, refetch } = usePersonSeasonStats(
    competition,
    personCode,
    season
  )

  const series = useMemo<GamePoint[]>(() => {
    const games = data?.games
    if (!games || games.length === 0) return []

    return games
      .map((entry, index): GamePoint => {
        const round = num(entry.game.round) || index + 1
        const playerClubCode = entry.playerClubCode
        const home = entry.game.local.club
        const road = entry.game.road.club
        const isHome = home.code === playerClubCode
        const opponent = isHome ? road : home
        return {
          round,
          label: `R${round}`,
          tooltipLabel: `Round ${round} · ${isHome ? "vs" : "@"} ${opponent.code}`,
          points: num(entry.stats.points),
          pir: num(entry.stats.valuation),
        }
      })
      .sort((a, b) => a.round - b.round)
  }, [data?.games])

  if (isPending) {
    return <Skeleton className="h-[300px] w-full rounded-lg" />
  }

  if (isError) {
    return <QueryError error={error} onRetry={() => void refetch()} />
  }

  if (series.length === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">
        No per-game data is available for this season.
      </p>
    )
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[300px] w-full"
    >
      <LineChart
        accessibilityLayer
        data={series}
        margin={{ left: 4, right: 12, top: 8 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={12}
        />
        <YAxis tickLine={false} axisLine={false} width={28} tickMargin={4} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => gameTooltipLabel(payload)}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          dataKey="points"
          type="monotone"
          stroke="var(--color-points)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
        <Line
          dataKey="pir"
          type="monotone"
          stroke="var(--color-pir)"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  )
}
