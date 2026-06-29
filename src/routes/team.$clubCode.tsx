import { Link, createFileRoute } from "@tanstack/react-router"

import { useClub } from "@/lib/hooks"
import { useAppSearch } from "@/lib/search"
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
  component: TeamRoute,
})

function TeamRoute() {
  const { clubCode } = Route.useParams()
  const { competition, season } = useAppSearch()
  const club = useClub(competition, season, clubCode)
  const clubName = club.data?.name ?? clubCode

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              render={
                <Link to="/" search={{ competition, season }}>
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

      <Tabs defaultValue="roster" className="space-y-4">
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
