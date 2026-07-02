import { useMemo } from "react"
import type { Competition } from "euroleague-api"
import { ArrowSquareOutIcon, CalculatorIcon } from "@phosphor-icons/react"

import { usePersonSeasonStats, useTeamStats } from "@/lib/hooks"
import {
  boxFromTeamStatRow,
  findTeamStatRow,
  groupPersonGamesByClub,
} from "@/lib/mappers"
import type { ClubRef } from "@/lib/mappers"
import { formatStat, playerAdvancedStats } from "@/lib/advanced"
import type { AdvancedStat } from "@/lib/advanced"
import { badgeVariants } from "@/components/ui/badge-variants"
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

interface ClubStintBase {
  club: ClubRef
  gamesPlayed: number
}

type Resolution =
  | {
      status: "ok"
      stints: Array<
        | (ClubStintBase & { status: "ok"; stats: AdvancedStat[] })
        | (ClubStintBase & { status: "no-team" })
      >
    }
  | { status: "no-games" }
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

function gamesLabel(gamesPlayed: number): string {
  return `${gamesPlayed} ${gamesPlayed === 1 ? "game" : "games"}`
}

export function AdvancedStats({ competition, personCode, season }: Props) {
  const personStats = usePersonSeasonStats(competition, personCode, season)
  const teamTraditional = useTeamStats(competition, season, "traditional", "Accumulated")
  const teamOpponents = useTeamStats(
    competition,
    season,
    "opponentsTraditional",
    "Accumulated",
  )

  const resolution = useMemo<Resolution>(() => {
    const games = personStats.data?.games
    const teams = teamTraditional.data
    const opponents = teamOpponents.data
    if (!games || !teams || !opponents) return null

    const clubStints = groupPersonGamesByClub(games)
    if (clubStints.length === 0) return { status: "no-games" }

    return {
      status: "ok",
      stints: clubStints.map((stint) => {
        const teamRow = findTeamStatRow(teams, stint.club.code)
        const opponentRow = findTeamStatRow(opponents, stint.club.code)
        const base = {
          club: stint.club,
          gamesPlayed: stint.box.gamesPlayed,
        }
        if (!teamRow || !opponentRow) return { ...base, status: "no-team" }

        return {
          ...base,
          status: "ok",
          stats: playerAdvancedStats(
            stint.box,
            boxFromTeamStatRow(teamRow),
            boxFromTeamStatRow(opponentRow),
          ),
        }
      }),
    }
  }, [personStats.data?.games, teamTraditional.data, teamOpponents.data])

  if (personStats.isError) {
    return <QueryError error={personStats.error} onRetry={() => void personStats.refetch()} />
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

  if (resolution.status === "no-games") {
    return (
      <Note>
        No games are recorded for this player in the selected season, so advanced
        metrics can&apos;t be computed here.
      </Note>
    )
  }

  return (
    <div className="space-y-5">
      {resolution.stints.map((stint) => (
        <section key={stint.club.code} className="space-y-2">
          <div className="space-y-1">
            <h3 className="font-heading text-base font-semibold tracking-tight">
              {stint.club.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {gamesLabel(stint.gamesPlayed)} for {stint.club.code}. Player totals use
              only those games; team context uses season team totals.
            </p>
          </div>

          {stint.status === "ok" ? (
            <div className={GRID}>
              {stint.stats.map((stat) => (
                <AdvancedStatCard key={`${stint.club.code}-${stat.key}`} stat={stat} />
              ))}
            </div>
          ) : (
            <Note>
              Couldn&apos;t resolve {stint.club.name} in the team-statistics dataset,
              so advanced metrics can&apos;t be computed for this club stint.
            </Note>
          )}
        </section>
      ))}
    </div>
  )
}
