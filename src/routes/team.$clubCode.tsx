import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"

import { useClub } from "@/lib/hooks"
import { useAppSearch } from "@/lib/search"
import { buildLandingSearch } from "@/lib/landing-search"
import type { TeamSearch } from "@/lib/team-search"
import {
  buildTeamSearch,
  teamPanel,
  teamSearchSchema,
} from "@/lib/team-search"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamHeader } from "@/components/team/team-header"
import { RosterPanel } from "@/components/team/roster-panel"
import { TeamStatsPanel } from "@/components/team/team-stats-panel"

export const Route = createFileRoute("/team/$clubCode")({
  validateSearch: teamSearchSchema,
  component: TeamRoute,
})

function TeamRoute() {
  const { clubCode } = Route.useParams()
  const search = Route.useSearch()
  const { competition, season } = useAppSearch()
  const navigate = useNavigate({ from: "/team/$clubCode" })
  const club = useClub(competition, season, clubCode)
  const clubName = club.data?.name ?? clubCode

  const setPanel = (value: string) => {
    void navigate({
      search: (prev: TeamSearch) =>
        buildTeamSearch({
          competition: prev.competition,
          season: prev.season,
          panel: value === "stats" ? "stats" : undefined,
        }),
    })
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              render={
                <Link to="/" search={buildLandingSearch({ competition, season })}>
                  Home
                </Link>
              }
            />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{clubName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <TeamHeader club={club} />

      <Tabs value={teamPanel(search)} onValueChange={setPanel} className="space-y-4">
        <TabsList>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="roster">
          <RosterPanel competition={competition} season={season} clubCode={clubCode} />
        </TabsContent>
        <TabsContent value="stats">
          <TeamStatsPanel competition={competition} season={season} clubCode={clubCode} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
