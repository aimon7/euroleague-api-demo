import type { Competition } from "euroleague-api"
import { Bar, CartesianGrid, Cell, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from "recharts"

import { useTeamSeasonArc } from "@/lib/hooks"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import type { TeamSeasonArcPoint } from "@/lib/team-season-arc"

interface TeamSeasonArcChartProps {
  competition: Competition
  season: number
  clubCode: string
}

const chartConfig = {
  margin: { label: "Margin", color: "var(--chart-2)" },
  rollingNetRating: { label: "3-game net rating", color: "var(--chart-3)" },
} satisfies ChartConfig

function gameTooltipLabel(payload: unknown): string {
  const items = payload as Array<{ payload?: TeamSeasonArcPoint }> | undefined
  return items?.[0]?.payload?.tooltipLabel ?? ""
}

export function TeamSeasonArcChart({
  competition,
  season,
  clubCode,
}: TeamSeasonArcChartProps) {
  const arc = useTeamSeasonArc(competition, season, clubCode)

  if (arc.isPending) {
    return <Skeleton className="h-64 w-full rounded-lg" />
  }

  if (arc.isError) {
    return <QueryError error={arc.error} onRetry={() => void arc.refetch()} />
  }

  if (arc.data.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        No played games are available for this team in the selected season.
      </p>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Season arc</CardTitle>
        <CardDescription>
          Game margin with a calculated 3-game rolling net rating from SDK boxscores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-64 w-full"
        >
          <ComposedChart
            accessibilityLayer
            data={arc.data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={12}
            />
            <YAxis tickLine={false} axisLine={false} width={36} tickMargin={4} />
            <ReferenceLine y={0} stroke="var(--border)" />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => gameTooltipLabel(payload)}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="margin"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              isAnimationActive={false}
            >
              {arc.data.map((point) => (
                <Cell
                  key={point.gameCode}
                  fill={
                    point.margin >= 0
                      ? "var(--color-margin)"
                      : "var(--muted-foreground)"
                  }
                />
              ))}
            </Bar>
            <Line
              dataKey="rollingNetRating"
              type="monotone"
              stroke="var(--color-rollingNetRating)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
