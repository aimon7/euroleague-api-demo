import { useMemo } from "react"
import type { Competition } from "euroleague-api"

import { usePersonSeasonStats } from "@/lib/hooks"
import { num } from "@/lib/mappers"
import { withRollingAverage } from "@/lib/player-game-series"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  useChartPrimitives,
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
  gameCode: number
  label: string
  tooltipLabel: string
  pir: number
  rollingPir: number | null
}

const chartConfig = {
  pir: { label: "PIR", color: "var(--chart-2)" },
  rollingPir: { label: "3-game PIR", color: "var(--chart-3)" },
} satisfies ChartConfig

function gameTooltipLabel(payload: unknown): string {
  const items = payload as Array<{ payload?: GamePoint }> | undefined
  return items?.[0]?.payload?.tooltipLabel ?? ""
}

export function PirTrend({ competition, personCode, season }: Props) {
  const { data, isPending, isError, error, refetch } = usePersonSeasonStats(
    competition,
    personCode,
    season,
  )

  const series = useMemo<GamePoint[]>(() => {
    const games = data?.games
    if (!games || games.length === 0) return []

    const gamePoints = games
      .map((entry, index): Omit<GamePoint, "rollingPir"> => {
        const round = num(entry.game.round) || index + 1
        const playerClubCode = entry.playerClubCode
        const home = entry.game.local.club
        const road = entry.game.road.club
        const isHome = home.code === playerClubCode
        const opponent = isHome ? road : home
        const pir = num(entry.stats.valuation)
        return {
          round,
          gameCode: num(entry.game.gameCode),
          label: `R${round}`,
          tooltipLabel: `Round ${round} · ${isHome ? "vs" : "@"} ${opponent.code} · PIR ${pir}`,
          pir,
        }
      })
      .sort((a, b) => a.round - b.round || a.gameCode - b.gameCode)

    return withRollingAverage(gamePoints, (point) => point.pir).map((point) => ({
      ...point,
      rollingPir: point.rollingAverage,
    }))
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
    <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
      <PirTrendChartBody series={series} />
    </ChartContainer>
  )
}

function PirTrendChartBody({ series }: { series: GamePoint[] }) {
  const { CartesianGrid, Line, LineChart, XAxis, YAxis } = useChartPrimitives()

  const dataMax = Math.max(...series.map((point) => point.pir))
  const domain: [number, number] = [0, Math.ceil(Math.max(20, dataMax) / 5) * 5]

  return (
    <LineChart accessibilityLayer data={series} margin={{ left: 4, right: 12, top: 8 }}>
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey="label"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        minTickGap={12}
      />
      <YAxis
        domain={domain}
        tickLine={false}
        axisLine={false}
        width={28}
        tickMargin={4}
      />
      <ChartTooltip
        content={
          <ChartTooltipContent
            labelFormatter={(_, payload) => gameTooltipLabel(payload)}
          />
        }
      />
      <ChartLegend content={<ChartLegendContent />} />
      <Line
        dataKey="pir"
        type="monotone"
        stroke="var(--color-pir)"
        strokeWidth={2}
        dot={{ r: 2 }}
        activeDot={{ r: 4 }}
        isAnimationActive={false}
      />
      <Line
        dataKey="rollingPir"
        type="monotone"
        stroke="var(--color-rollingPir)"
        strokeWidth={2}
        strokeDasharray="4 4"
        dot={false}
        activeDot={{ r: 4 }}
        isAnimationActive={false}
      />
    </LineChart>
  )
}
