import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { useAppSearch } from "@/lib/search"
import type { LandingSearch } from "@/lib/landing-search"
import {
  buildLandingSearch,
  landingSearchSchema,
  landingTab,
} from "@/lib/landing-search"
import { COMPETITION_LABELS } from "@/lib/euroleague"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClubsGrid } from "@/components/landing/clubs-grid"
import { StandingsTable } from "@/components/landing/standings-table"

const heroLogoUrl = `${import.meta.env.BASE_URL}logo-hero.jpg`

export const Route = createFileRoute("/")({
  validateSearch: landingSearchSchema,
  component: Landing,
})

function Landing() {
  const search = Route.useSearch()
  const { competition, season } = useAppSearch()
  const navigate = useNavigate({ from: "/" })

  const setTab = (value: string) => {
    void navigate({
      search: (prev: LandingSearch) =>
        buildLandingSearch({
          competition: prev.competition,
          season: prev.season,
          tab: value === "standings" ? "standings" : undefined,
        }),
    })
  }

  return (
    <div className="space-y-6">
      <section className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-8">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {COMPETITION_LABELS[competition]}, fully typed.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            A live showcase of the{" "}
            <span className="font-medium text-foreground">euroleague-api</span>{" "}
            SDK. Pick a competition and season above, browse the clubs, sort the
            standings, and drill into any team or player — with advanced stats
            computed in the browser.
          </p>
        </div>
        <div className="mx-auto w-fit shrink-0 sm:mx-0">
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
            <img
              src={heroLogoUrl}
              alt=""
              aria-hidden
              width={512}
              height={512}
              fetchPriority="high"
              decoding="async"
              className="block size-48 object-contain sm:size-64"
            />
          </div>
        </div>
      </section>

      <Tabs
        value={landingTab(search)}
        onValueChange={setTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
        </TabsList>
        <TabsContent value="clubs">
          <ClubsGrid competition={competition} season={season} />
        </TabsContent>
        <TabsContent value="standings">
          <StandingsTable competition={competition} season={season} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
