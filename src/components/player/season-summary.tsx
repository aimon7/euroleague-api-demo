import type { Competition, PersonStats } from "euroleague-api"

import { pirPer40, starterRate } from "@/lib/advanced/formulas"
import { usePersonSeasonStats, usePlayerStats } from "@/lib/hooks"
import { findPlayerStatRow, num } from "@/lib/mappers"
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
type AccumulatedLine = PersonStats["accumulated"]

interface Metric {
  key: string
  label: string
  value: string
  hint?: string
}

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-4"
const CONTEXT_GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"

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

function signedInteger(value: unknown): string {
  const n = num(value)
  if (n > 0) return `+${n}`
  return String(n)
}

function contextMetrics(
  accumulated: AccumulatedLine,
  averagePerGame: StatLine,
  misc: { doubleDoubles: unknown; tripleDoubles: unknown } | null,
): Metric[] {
  const timePlayed = num(accumulated.timePlayed)
  const gamesPlayed = num(accumulated.gamesPlayed)
  const gamesStarted = num(accumulated.gamesStarted)
  const valuation = num(accumulated.valuation)

  return [
    {
      key: "pir40",
      label: "PIR/40",
      value: oneDecimal(pirPer40(valuation, timePlayed)),
      hint: "Calculated",
    },
    {
      key: "starter",
      label: "Starter rate",
      value: `${starterRate(gamesStarted, gamesPlayed).toFixed(1)}%`,
      hint: `${gamesStarted}/${gamesPlayed} starts`,
    },
    {
      key: "pm",
      label: "+/-",
      value: signedInteger(averagePerGame.plusMinus),
      hint: `Season ${signedInteger(accumulated.plusMinus)} · From API`,
    },
    {
      key: "dd",
      label: "Double-doubles",
      value: misc ? String(num(misc.doubleDoubles)) : "—",
      hint: misc ? "From API" : undefined,
    },
    {
      key: "td",
      label: "Triple-doubles",
      value: misc ? String(num(misc.tripleDoubles)) : "—",
      hint: misc ? "From API" : undefined,
    },
  ]
}

export function SeasonSummary({ competition, personCode, season }: Props) {
  const seasonStats = usePersonSeasonStats(competition, personCode, season)
  const miscStats = usePlayerStats(competition, season, "misc")

  const { data, isPending, isError, error, refetch } = seasonStats

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className={GRID}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
          ))}
        </div>
        <div className={CONTEXT_GRID}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
          ))}
        </div>
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
  const miscRow = findPlayerStatRow(miscStats.data, personCode)
  const context = contextMetrics(
    data.accumulated,
    data.averagePerGame,
    miscRow
      ? {
          doubleDoubles: miscRow.doubleDoubles,
          tripleDoubles: miscRow.tripleDoubles,
        }
      : null,
  )

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

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Season context</p>
        {miscStats.isError ? (
          <QueryError
            error={miscStats.error}
            onRetry={() => void miscStats.refetch()}
          />
        ) : (
          <div className={CONTEXT_GRID}>
            {context.map((metric) => (
              <StatCard
                key={metric.key}
                label={metric.label}
                value={miscStats.isPending && (metric.key === "dd" || metric.key === "td") ? "…" : metric.value}
                hint={metric.hint}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
