import { useMemo } from "react"
import type { Competition } from "euroleague-api"
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts"

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
  gameCode: number
  label: string
  tooltipLabel: string
  points: number
  shootingPossessions: number
  trueShootingPct: number | null
  rollingTrueShootingPct: number | null
}

const chartConfig = {
  trueShootingPct: { label: "TS%", color: "var(--chart-2)" },
  rollingTrueShootingPct: { label: "3-game TS%", color: "var(--chart-3)" },
  shootingPossessions: { label: "Shooting poss.", color: "var(--chart-1)" },
} satisfies ChartConfig

function gameTooltipLabel(payload: unknown): string {
  const items = payload as Array<{ payload?: GamePoint }> | undefined
  return items?.[0]?.payload?.tooltipLabel ?? ""
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function trueShootingPct(points: number, fieldGoalAttempts: number, freeThrowAttempts: number) {
  const shootingPossessions = fieldGoalAttempts + 0.44 * freeThrowAttempts
  if (shootingPossessions === 0) return null
  return round1((points / (2 * shootingPossessions)) * 100)
}

function withRollingTrueShooting(games: GamePoint[]): GamePoint[] {
  return games.map((game, index) => {
    const window = games.slice(Math.max(0, index - 2), index + 1)
    const validWindow = window.filter((point) => point.trueShootingPct !== null)
    if (validWindow.length === 0) return game

    const weightedTs =
      validWindow.reduce(
        (total, point) =>
          total + (point.trueShootingPct ?? 0) * point.shootingPossessions,
        0
      ) / validWindow.reduce((total, point) => total + point.shootingPossessions, 0)

    return { ...game, rollingTrueShootingPct: round1(weightedTs) }
  })
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

    const gamePoints = games
      .map((entry, index): GamePoint => {
        const round = num(entry.game.round) || index + 1
        const playerClubCode = entry.playerClubCode
        const home = entry.game.local.club
        const road = entry.game.road.club
        const isHome = home.code === playerClubCode
        const opponent = isHome ? road : home
        const points = num(entry.stats.points)
        const fieldGoalAttempts = num(entry.stats.fieldGoalsAttemptedTotal)
        const freeThrowAttempts = num(entry.stats.freeThrowsAttempted)
        const shootingPossessions = round1(fieldGoalAttempts + 0.44 * freeThrowAttempts)
        return {
          round,
          gameCode: num(entry.game.gameCode),
          label: `R${round}`,
          tooltipLabel: `Round ${round} · ${isHome ? "vs" : "@"} ${opponent.code} · ${points} pts`,
          points,
          shootingPossessions,
          trueShootingPct: trueShootingPct(points, fieldGoalAttempts, freeThrowAttempts),
          rollingTrueShootingPct: null,
        }
      })
      .sort((a, b) => a.round - b.round || a.gameCode - b.gameCode)

    return withRollingTrueShooting(gamePoints)
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
      <ComposedChart
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
        <YAxis
          yAxisId="efficiency"
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          width={28}
          tickMargin={4}
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis
          yAxisId="volume"
          orientation="right"
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
        <Bar
          yAxisId="volume"
          dataKey="shootingPossessions"
          fill="var(--color-shootingPossessions)"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
          isAnimationActive={false}
        />
        <Line
          yAxisId="efficiency"
          dataKey="trueShootingPct"
          type="monotone"
          stroke="var(--color-trueShootingPct)"
          strokeWidth={2}
          dot={{ r: 2 }}
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
        <Line
          yAxisId="efficiency"
          dataKey="rollingTrueShootingPct"
          type="monotone"
          stroke="var(--color-rollingTrueShootingPct)"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={false}
          activeDot={{ r: 4 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ChartContainer>
  )
}
