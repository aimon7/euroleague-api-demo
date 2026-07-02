import { useMemo } from "react"

import type { AdvancedStat } from "@/lib/advanced"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  useChartPrimitives,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  value: { label: "Rating" },
  ortg: { label: "Offensive", color: "var(--chart-2)" },
  drtg: { label: "Defensive", color: "var(--chart-3)" },
} satisfies ChartConfig

interface RatingDatum {
  key: "ortg" | "drtg"
  label: string
  value: number
  fill: string
}

// A 5-point pad below the smaller bar and above the larger one keeps both
// efficiency ratings readable without the misleading look of a zero baseline.
const Y_DOMAIN: [(min: number) => number, (max: number) => number] = [
  (min) => Math.floor((min - 5) / 5) * 5,
  (max) => Math.ceil((max + 5) / 5) * 5,
]

export function TeamRatingsChart({ stats }: { stats: AdvancedStat[] }) {
  const data = useMemo<RatingDatum[]>(() => {
    const valueOf = (key: string) => {
      const found = stats.find((stat) => stat.key === key)
      return found?.value ?? 0
    }
    return [
      {
        key: "ortg",
        label: "Offensive",
        value: round1(valueOf("ortg")),
        fill: "var(--color-ortg)",
      },
      {
        key: "drtg",
        label: "Defensive",
        value: round1(valueOf("drtg")),
        fill: "var(--color-drtg)",
      },
    ]
  }, [stats])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Efficiency ratings</CardTitle>
        <CardDescription>
          Points per 100 possessions — scored vs. allowed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TeamRatingsChartBody data={data} />
      </CardContent>
    </Card>
  )
}

function TeamRatingsChartBody({ data }: { data: RatingDatum[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-52 w-full">
      <TeamRatingsChartPlot data={data} />
    </ChartContainer>
  )
}

function TeamRatingsChartPlot({ data }: { data: RatingDatum[] }) {
  const { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } =
    useChartPrimitives()

  return (
    <BarChart
      accessibilityLayer
      data={data}
      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
    >
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey="label"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
      />
      <YAxis
        domain={Y_DOMAIN}
        tickLine={false}
        axisLine={false}
        width={36}
        tickMargin={4}
      />
      <ChartTooltip
        cursor={false}
        content={<ChartTooltipContent hideLabel />}
      />
      <Bar
        dataKey="value"
        radius={[6, 6, 0, 0]}
        maxBarSize={96}
        isAnimationActive={false}
      >
        {data.map((datum) => (
          <Cell key={datum.key} fill={datum.fill} />
        ))}
      </Bar>
    </BarChart>
  )
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}
