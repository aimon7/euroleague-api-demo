import { useMemo } from "react"
import type { Competition } from "euroleague-api"

import { usePersonSeasonStats } from "@/lib/hooks"
import { num } from "@/lib/mappers"
import { round1, withRollingAverage } from "@/lib/player-game-series"
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
  plusMinus: number
  rollingPlusMinus: number | null
}

const chartConfig = {
  plusMinus: { label: "+/-", color: "var(--chart-2)" },
  rollingPlusMinus: { label: "3-game +/-", color: "var(--chart-3)" },
} satisfies ChartConfig

function gameTooltipLabel(payload: unknown): string {
  const items = payload as Array<{ payload?: GamePoint }> | undefined
  return items?.[0]?.payload?.tooltipLabel ?? ""
}

function signedTick(value: number): string {
  if (value > 0) return `+${value}`
  return String(value)
}

export function PlusMinusTrend({ competition, personCode, season }: Props) {
  const { data, isPending, isError, error, refetch } = usePersonSeasonStats(
    competition,
    personCode,
    season,
  )

  const series = useMemo<GamePoint[]>(() => {
    const games = data?.games
    if (!games || games.length === 0) return []

    const gamePoints = games
      .map((entry, index): Omit<GamePoint, "rollingPlusMinus"> => {
        const round = num(entry.game.round) || index + 1
        const playerClubCode = entry.playerClubCode
        const home = entry.game.local.club
        const road = entry.game.road.club
        const isHome = home.code === playerClubCode
        const opponent = isHome ? road : home
        const plusMinus = num(entry.stats.plusMinus)
        return {
          round,
          gameCode: num(entry.game.gameCode),
          label: `R${round}`,
          tooltipLabel: `Round ${round} · ${isHome ? "vs" : "@"} ${opponent.code} · ${signedTick(plusMinus)}`,
          plusMinus,
        }
      })
      .sort((a, b) => a.round - b.round || a.gameCode - b.gameCode)

    return withRollingAverage(
      gamePoints,
      (point) => point.plusMinus,
      () => true,
    ).map((point) => ({
      ...point,
      rollingPlusMinus: point.rollingAverage,
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
      <PlusMinusTrendChartBody series={series} />
    </ChartContainer>
  )
}

function PlusMinusTrendChartBody({ series }: { series: GamePoint[] }) {
  const { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } =
    useChartPrimitives()

  const maxAbs = Math.max(
    10,
    ...series.flatMap((point) => [
      Math.abs(point.plusMinus),
      Math.abs(point.rollingPlusMinus ?? 0),
    ]),
  )
  const domain: [number, number] = [-Math.ceil(maxAbs / 5) * 5, Math.ceil(maxAbs / 5) * 5]

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
        width={32}
        tickMargin={4}
        tickFormatter={signedTick}
      />
      <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
      <ChartTooltip
        content={
          <ChartTooltipContent
            labelFormatter={(_, payload) => gameTooltipLabel(payload)}
            formatter={(value, name) => {
              const n = typeof value === "number" ? value : num(value)
              const configKey = name as keyof typeof chartConfig
              return [signedTick(round1(n)), chartConfig[configKey].label]
            }}
          />
        }
      />
      <ChartLegend content={<ChartLegendContent />} />
      <Line
        dataKey="plusMinus"
        type="monotone"
        stroke="var(--color-plusMinus)"
        strokeWidth={2}
        dot={{ r: 2 }}
        activeDot={{ r: 4 }}
        isAnimationActive={false}
      />
      <Line
        dataKey="rollingPlusMinus"
        type="monotone"
        stroke="var(--color-rollingPlusMinus)"
        strokeWidth={2}
        strokeDasharray="4 4"
        dot={false}
        activeDot={{ r: 4 }}
        isAnimationActive={false}
      />
    </LineChart>
  )
}
