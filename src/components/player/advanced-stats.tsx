import { useMemo } from "react"
import type { Competition } from "euroleague-api"
import { ArrowSquareOutIcon, CalculatorIcon } from "@phosphor-icons/react"

import { usePlayerStats, useTeamStats } from "@/lib/hooks"
import { boxFromStatRow, boxFromTeamStatRow, parseClubRef, parseEntity } from "@/lib/mappers"
import { formatStat, playerAdvancedStats } from "@/lib/advanced"
import type { AdvancedStat } from "@/lib/advanced"
import { badgeVariants } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { QueryError } from "@/components/app/query-error"
import { cn } from "@/lib/utils"

interface Props {
  competition: Competition
  personCode: string
  season: number
}

interface PlayerRef {
  code?: string | null
  team?: { code?: string | null } | null
}

type Resolution =
  | { status: "ok"; stats: AdvancedStat[] }
  | { status: "no-player" }
  | { status: "no-team" }
  | null

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"

function AdvancedStatCard({ stat }: { stat: AdvancedStat }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[0.625rem] font-medium tracking-wide text-muted-foreground uppercase">
            {stat.label}
          </span>
          <Tooltip>
            <TooltipTrigger
              className={cn(badgeVariants({ variant: "secondary" }), "cursor-help gap-1")}
            >
              <CalculatorIcon />
              Calculated
            </TooltipTrigger>
            <TooltipContent className="max-w-72 flex-col items-start gap-1 text-left">
              <span className="font-medium">Computed in your browser</span>
              <span className="font-mono text-[0.7rem] leading-relaxed text-background/80">
                {stat.formula}
              </span>
            </TooltipContent>
          </Tooltip>
        </div>
        <span className="font-heading text-2xl leading-none font-semibold tabular-nums">
          {formatStat(stat)}
        </span>
        <a
          href={stat.reference}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-1 text-[0.625rem] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Methodology
          <ArrowSquareOutIcon />
        </a>
      </CardContent>
    </Card>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
      {children}
    </p>
  )
}

export function AdvancedStats({ competition, personCode, season }: Props) {
  const players = usePlayerStats(competition, season, "traditional", "Accumulated")
  const teamTraditional = useTeamStats(competition, season, "traditional", "Accumulated")
  const teamOpponents = useTeamStats(
    competition,
    season,
    "opponentsTraditional",
    "Accumulated",
  )

  const resolution = useMemo<Resolution>(() => {
    const rows = players.data
    const teams = teamTraditional.data
    const opponents = teamOpponents.data
    if (!rows || !teams || !opponents) return null

    const playerRow = rows.find((row) => parseEntity<PlayerRef>(row.player)?.code === personCode)
    if (!playerRow) return { status: "no-player" }

    const teamCode = parseEntity<PlayerRef>(playerRow.player)?.team?.code
    const teamRow = teamCode
      ? teams.find((row) => parseClubRef(row.team)?.code === teamCode)
      : undefined
    const opponentRow = teamCode
      ? opponents.find((row) => parseClubRef(row.team)?.code === teamCode)
      : undefined
    if (!teamRow || !opponentRow) return { status: "no-team" }

    return {
      status: "ok",
      stats: playerAdvancedStats(
        boxFromStatRow(playerRow),
        boxFromTeamStatRow(teamRow),
        boxFromTeamStatRow(opponentRow),
      ),
    }
  }, [players.data, teamTraditional.data, teamOpponents.data, personCode])

  if (players.isError) {
    return <QueryError error={players.error} onRetry={() => void players.refetch()} />
  }
  if (teamTraditional.isError) {
    return (
      <QueryError
        error={teamTraditional.error}
        onRetry={() => void teamTraditional.refetch()}
      />
    )
  }
  if (teamOpponents.isError) {
    return (
      <QueryError error={teamOpponents.error} onRetry={() => void teamOpponents.refetch()} />
    )
  }

  if (resolution === null) {
    return (
      <div className={GRID}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (resolution.status === "no-player") {
    return (
      <Note>
        This player isn&apos;t present in the season&apos;s aggregated player-statistics
        dataset (usually due to very limited minutes), so advanced metrics can&apos;t be
        computed here.
      </Note>
    )
  }

  if (resolution.status === "no-team") {
    return (
      <Note>
        Couldn&apos;t resolve this player&apos;s team in the team-statistics dataset, so
        advanced metrics can&apos;t be computed here.
      </Note>
    )
  }

  return (
    <div className={GRID}>
      {resolution.stats.map((stat) => (
        <AdvancedStatCard key={stat.key} stat={stat} />
      ))}
    </div>
  )
}
