import { createFileRoute } from "@tanstack/react-router"

import { useAppSearch } from "@/lib/search"
import { COMPETITION_LABELS } from "@/lib/euroleague"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClubsGrid } from "@/components/landing/clubs-grid"
import { StandingsTable } from "@/components/landing/standings-table"

export const Route = createFileRoute("/")({
  component: Landing,
})

function Landing() {
  const { competition, season } = useAppSearch()

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {COMPETITION_LABELS[competition]}, fully typed.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          A live showcase of the{" "}
          <span className="font-medium text-foreground">euroleague-api</span> SDK. Pick a
          competition and season above, browse the clubs, sort the standings, and drill into
          any team or player — with advanced stats computed in the browser.
        </p>
      </section>

      <Tabs defaultValue="clubs" className="space-y-4">
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
