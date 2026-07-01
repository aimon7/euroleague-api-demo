import { useMemo } from "react"
import type { Competition, TeamStat } from "euroleague-api"

import { useTeamStats } from "@/lib/hooks"
import { boxFromStatRow, parseClubRef } from "@/lib/mappers"
import { teamAdvancedStats } from "@/lib/advanced"
import type { AdvancedStat } from "@/lib/advanced"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/app/query-error"
import { AdvancedStatCard } from "./advanced-stat-card"
import { TeamRatingsChart } from "./team-ratings-chart"

interface TeamStatsPanelProps {
  competition: Competition
  season: number
  clubCode: string
}

const STAT_GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"

export function TeamStatsPanel({ competition, season, clubCode }: TeamStatsPanelProps) {
  const traditional = useTeamStats(competition, season, "traditional")
  const opponents = useTeamStats(competition, season, "opponentsTraditional")
  const advanced = useTeamStats(competition, season, "advanced")

  // The advanced computation parses every team's `team` JSON and runs the
  // possession math, so it is the one derivation worth memoizing here.
  const stats = useMemo<AdvancedStat[] | null>(() => {
    if (!traditional.data || !opponents.data || !advanced.data) {
      return null
    }
    const findRow = (rows: TeamStat[]) =>
      rows.find((row) => parseClubRef(row.team)?.code === clubCode)

    const teamRow = findRow(traditional.data)
    const oppRow = findRow(opponents.data)
    if (!teamRow || !oppRow) {
      return null
    }
    const advancedRow = findRow(advanced.data)
    return teamAdvancedStats(boxFromStatRow(teamRow), boxFromStatRow(oppRow), advancedRow)
  }, [traditional.data, opponents.data, advanced.data, clubCode])

  if (traditional.isError || opponents.isError || advanced.isError) {
    return (
      <div className="space-y-3">
        {traditional.isError ? (
          <QueryError error={traditional.error} onRetry={() => void traditional.refetch()} />
        ) : null}
        {opponents.isError ? (
          <QueryError error={opponents.error} onRetry={() => void opponents.refetch()} />
        ) : null}
        {advanced.isError ? (
          <QueryError error={advanced.error} onRetry={() => void advanced.refetch()} />
        ) : null}
      </div>
    )
  }

  if (traditional.isPending || opponents.isPending || advanced.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-[2/1] w-full rounded-lg" />
        <div className={STAT_GRID}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <p className="py-10 text-sm text-muted-foreground">
        No team stats are available for this club this season.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <TeamRatingsChart stats={stats} />
      <div className={STAT_GRID}>
        {stats.map((stat) => (
          <AdvancedStatCard key={stat.key} stat={stat} />
        ))}
      </div>
    </div>
  )
}
