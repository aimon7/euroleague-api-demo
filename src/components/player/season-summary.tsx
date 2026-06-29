import type { Competition, PersonStats } from "euroleague-api"

import { usePersonSeasonStats } from "@/lib/hooks"
import { num } from "@/lib/mappers"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/app/query-error"
import { StatCard } from "./stat-card"
import { oneDecimal, secondsToMinutes, shootingPct } from "./format"

interface Props {
  competition: Competition
  personCode: string
  season: number
}

type StatLine = PersonStats["averagePerGame"]

interface Metric {
  key: string
  label: string
  value: string
  hint?: string
}

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-4"

function perGameMetrics(line: StatLine): Metric[] {
  return [
    { key: "pts", label: "PTS", value: oneDecimal(line.points) },
    { key: "reb", label: "REB", value: oneDecimal(line.totalRebounds) },
    { key: "ast", label: "AST", value: oneDecimal(line.assistances) },
    { key: "pir", label: "PIR", value: oneDecimal(line.valuation) },
    { key: "min", label: "MIN", value: secondsToMinutes(line.timePlayed).toFixed(1) },
    { key: "stl", label: "STL", value: oneDecimal(line.steals) },
    { key: "blk", label: "BLK", value: oneDecimal(line.blocksFavour) },
    { key: "tov", label: "TO", value: oneDecimal(line.turnovers) },
  ]
}

function shootingMetrics(line: StatLine): Metric[] {
  const split = (made: unknown, attempted: unknown) =>
    `${num(made)}/${num(attempted)}`
  return [
    {
      key: "fg",
      label: "FG%",
      value: shootingPct(line.fieldGoalsMadeTotal, line.fieldGoalsAttemptedTotal),
      hint: split(line.fieldGoalsMadeTotal, line.fieldGoalsAttemptedTotal),
    },
    {
      key: "2p",
      label: "2P%",
      value: shootingPct(line.fieldGoalsMade2, line.fieldGoalsAttempted2),
      hint: split(line.fieldGoalsMade2, line.fieldGoalsAttempted2),
    },
    {
      key: "3p",
      label: "3P%",
      value: shootingPct(line.fieldGoalsMade3, line.fieldGoalsAttempted3),
      hint: split(line.fieldGoalsMade3, line.fieldGoalsAttempted3),
    },
    {
      key: "ft",
      label: "FT%",
      value: shootingPct(line.freeThrowsMade, line.freeThrowsAttempted),
      hint: split(line.freeThrowsMade, line.freeThrowsAttempted),
    },
  ]
}

export function SeasonSummary({ competition, personCode, season }: Props) {
  const { data, isPending, isError, error, refetch } = usePersonSeasonStats(
    competition,
    personCode,
    season,
  )

  if (isPending) {
    return (
      <div className={GRID}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <QueryError error={error} onRetry={() => void refetch()} />
  }

  const gamesPlayed = num(data.accumulated.gamesPlayed)
  if (gamesPlayed === 0) {
    return (
      <p className="py-6 text-sm text-muted-foreground">
        No games recorded for this player in the selected season.
      </p>
    )
  }

  const perGame = perGameMetrics(data.averagePerGame)
  const shooting = shootingMetrics(data.accumulated)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Per game · {gamesPlayed} {gamesPlayed === 1 ? "game" : "games"}
        </p>
        <div className={GRID}>
          {perGame.map((metric) => (
            <StatCard key={metric.key} label={metric.label} value={metric.value} />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Shooting splits · season totals</p>
        <div className={GRID}>
          {shooting.map((metric) => (
            <StatCard
              key={metric.key}
              label={metric.label}
              value={metric.value}
              hint={metric.hint}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
