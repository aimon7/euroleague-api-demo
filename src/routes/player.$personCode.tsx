import type { ReactNode } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"

import { buildLandingSearch } from "@/lib/landing-search"
import { appSearchSchema, useAppSearch } from "@/lib/search"
import { usePersonProfile } from "@/lib/hooks"
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
import { GameTrend } from "@/components/player/game-trend"
import { personDisplayName } from "@/components/player/format"

export const Route = createFileRoute("/player/$personCode")({
  validateSearch: appSearchSchema,
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
        <h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}

function PlayerRoute() {
  const { personCode } = Route.useParams()
  const { competition, season } = useAppSearch()
  const profile = usePersonProfile(competition, personCode)
  const name = profile.data ? personDisplayName(profile.data) : "Player"

  return (
    <div className="space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              render={
                <Link to="/" search={buildLandingSearch({ competition, season })} />
              }
            >
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PlayerHeader competition={competition} personCode={personCode} />

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
        <GameTrend competition={competition} personCode={personCode} season={season} />
      </Section>
    </div>
  )
}
