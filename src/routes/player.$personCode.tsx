import { createFileRoute, Link } from "@tanstack/react-router"

import { useAppSearch } from "@/lib/search"
import { usePersonProfile, usePersonSeasonStats, useClub } from "@/lib/hooks"
import { PlayerHeader } from "@/components/player/player-header"
import { PlayerSeasonStats } from "@/components/player/player-season-stats"
import { PlayerAdvancedStats } from "@/components/player/player-advanced-stats"
import { PlayerGameChart } from "@/components/player/player-game-chart"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const Route = createFileRoute("/player/$personCode")({
  component: PlayerRoute,
})

function PlayerRoute() {
  const { personCode } = Route.useParams()
  const search = useAppSearch()
  const { competition, season } = search

  const profile = usePersonProfile(competition, personCode)
  const seasonStats = usePersonSeasonStats(competition, personCode, season)

  const clubFromGames = seasonStats.data?.games[0]?.playerClubCode ?? null
  const club = useClub(competition, season, clubFromGames ?? "")

  const playerName = profile.data?.passportName ?? profile.data?.name ?? personCode
  const teamName = club.data?.name

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/" search={search} />}>Clubs</BreadcrumbLink>
          </BreadcrumbItem>
          {clubFromGames ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  render={
                    <Link
                      to="/team/$clubCode"
                      params={{ clubCode: clubFromGames }}
                      search={search}
                    />
                  }
                >
                  {teamName ?? clubFromGames}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          ) : null}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{playerName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PlayerHeader
        profile={profile.data}
        isPending={profile.isPending}
        isError={profile.isError}
        error={profile.error}
        onRetry={() => void profile.refetch()}
      />

      <PlayerSeasonStats
        stats={seasonStats.data}
        isPending={seasonStats.isPending}
        isError={seasonStats.isError}
        error={seasonStats.error}
        onRetry={() => void seasonStats.refetch()}
      />

      <PlayerGameChart stats={seasonStats.data} isPending={seasonStats.isPending} />

      <PlayerAdvancedStats
        competition={competition}
        season={season}
        personCode={personCode}
        clubCode={clubFromGames}
      />
    </div>
  )
}
