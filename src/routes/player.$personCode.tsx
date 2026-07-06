import { lazy, Suspense } from "react"
import type { ReactNode } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"

import { buildLandingSearch } from "@/lib/landing-search"
import { playerSearchSchema } from "@/lib/player-search"
import { buildTeamSearch } from "@/lib/team-search"
import { useClub, usePersonProfile, usePersonSeasonRegistration } from "@/lib/hooks"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { PlayerHeader } from "@/components/player/player-header"
import { SeasonSummary } from "@/components/player/season-summary"
import { AdvancedStats } from "@/components/player/advanced-stats"
import { personDisplayName } from "@/components/player/format"
import { Skeleton } from "@/components/ui/skeleton"

const GameTrend = lazy(() =>
  import("@/components/player/game-trend").then((module) => ({
    default: module.GameTrend,
  }))
)

export const Route = createFileRoute("/player/$personCode")({
  validateSearch: playerSearchSchema,
  component: PlayerRoute,
})

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function PlayerRoute() {
  const { personCode } = Route.useParams()
  const { competition, season, club: clubFromSearch } = Route.useSearch()
  const profile = usePersonProfile(competition, personCode)
  const registration = usePersonSeasonRegistration(competition, personCode, season, {
    enabled: clubFromSearch == null,
  })
  const clubCode = clubFromSearch ?? registration.data?.club.code
  const club = useClub(competition, season, clubCode ?? "")
  const clubName = club.data?.name ?? registration.data?.club.name ?? clubCode
  const name = profile.data ? personDisplayName(profile.data) : "Player"

  return (
    <div className="space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              render={
                <Link
                  to="/"
                  search={buildLandingSearch({ competition, season })}
                />
              }
            >
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          {clubCode ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  render={
                    <Link
                      to="/team/$clubCode"
                      params={{ clubCode }}
                      search={buildTeamSearch({ competition, season })}
                    />
                  }
                >
                  {clubName}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          ) : registration.isPending ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Skeleton className="h-4 w-28" />
              </BreadcrumbItem>
            </>
          ) : null}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PlayerHeader
        competition={competition}
        personCode={personCode}
        season={season}
      />

      <Section
        title="Season averages"
        description="Per-game production and shooting splits from people.getSeasonStats."
      >
        <SeasonSummary
          competition={competition}
          personCode={personCode}
          season={season}
        />
      </Section>

      <Section
        title="Advanced metrics"
        description="Derived live in your browser from box-score totals — these aren't returned by the API."
      >
        <AdvancedStats
          competition={competition}
          personCode={personCode}
          season={season}
        />
      </Section>

      <Section
        title="Efficiency trend"
        description="True Shooting % by game, its 3-game rolling trend, and the shooting volume behind each point."
      >
        <Suspense
          fallback={<Skeleton className="h-[300px] w-full rounded-lg" />}
        >
          <GameTrend
            competition={competition}
            personCode={personCode}
            season={season}
          />
        </Suspense>
      </Section>
    </div>
  )
}
