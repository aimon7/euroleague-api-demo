import { useMemo } from "react"
import type { Competition } from "euroleague-api"

import { playerAdvancedStats } from "@/lib/advanced"
import {
  boxFromStatRow,
  findPlayerStatRow,
  findTeamStatRow,
  parseClubRef,
  parseEntity,
} from "@/lib/mappers"
import { usePlayerStats, useTeamStats } from "@/lib/hooks"
import { AdvancedStatCard } from "@/components/stats/advanced-stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/app/query-error"

interface Props {
  competition: Competition
  season: number
  personCode: string
  clubCode: string | null
}

export function PlayerAdvancedStats({ competition, season, personCode, clubCode }: Props) {
  const playerTraditional = usePlayerStats(competition, season, "traditional")
  const teamTraditional = useTeamStats(competition, season, "traditional")
  const oppTraditional = useTeamStats(competition, season, "opponentsTraditional")

  const isPending =
    playerTraditional.isPending || teamTraditional.isPending || oppTraditional.isPending
  const isError =
    playerTraditional.isError || teamTraditional.isError || oppTraditional.isError
  const error =
    playerTraditional.error ?? teamTraditional.error ?? oppTraditional.error

  const onRetry = () => {
    void playerTraditional.refetch()
    void teamTraditional.refetch()
    void oppTraditional.refetch()
  }

  const stats = useMemo(() => {
    const playerRow = findPlayerStatRow(playerTraditional.data, personCode)
    if (!playerRow) return null

    const player = parseEntity<{ team?: unknown }>(playerRow.player)
    const resolvedClub = clubCode ?? parseClubRef(player?.team)?.code ?? null
    if (!resolvedClub) return null

    const teamRow = findTeamStatRow(teamTraditional.data, resolvedClub)
    const oppRow = findTeamStatRow(oppTraditional.data, resolvedClub)
    if (!teamRow || !oppRow) return null

    return playerAdvancedStats(
      boxFromStatRow(playerRow),
      boxFromStatRow(teamRow),
      boxFromStatRow(oppRow),
    )
  }, [playerTraditional.data, teamTraditional.data, oppTraditional.data, personCode, clubCode])

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) return <QueryError error={error} onRetry={onRetry} />
  if (!stats) {
    return (
      <p className="text-sm text-muted-foreground">
        Advanced stats need the player&apos;s club in this season.
      </p>
    )
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium">Advanced metrics (calculated)</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <AdvancedStatCard key={stat.key} stat={stat} />
        ))}
      </div>
    </section>
  )
}
