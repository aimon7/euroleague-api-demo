import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RESOURCE_NAMES } from "@/lib/docs/types"

const RESOURCE_SUMMARY: Record<
  (typeof RESOURCE_NAMES)[number],
  string
> = {
  boxscore: "getGame, getPlayerStats, getQuarterScores, …",
  clubs: "list, get, getRoster, getLogo",
  competitions: "list, get",
  gameMetadata: "getGame, getRound, getSeason, getSeasons",
  games: "getReport, getStats, getTeamsComparison, …",
  people: "getProfile, getSeasonStats, getCareerStats, …",
  phases: "list, get",
  playByPlay: "getGame, getLineups, …",
  players: "getStats, getLeaders, getStatsRange, …",
  rounds: "list, get",
  schedule: "getSeason, getRound, getSeasons",
  seasons: "list, get",
  shots: "getGame, getRound, getSeason, getSeasons",
  standings: "getRound",
  teams: "getStats, getLeaders, getStatsRange, …",
}

export function GuidePanel() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          euroleague-api SDK
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          A strongly-typed TypeScript client for the public EuroLeague and EuroCup
          APIs. This demo runs the SDK directly in the browser — no backend or
          proxy required.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Install</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-sm">
            <code>npm install euroleague-api</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick start</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-sm leading-relaxed">
            <code>{`import { EuroleagueClient } from "euroleague-api"

const client = new EuroleagueClient({ competition: "euroleague" })

const stats = await client.players.getStats({
  season: 2025,
  type: "traditional",
  mode: "PerGame",
})`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client options</CardTitle>
          <CardDescription>
            Configure competition, timeouts, retries, and a custom fetch
            implementation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-sm leading-relaxed">
            <code>{`const client = new EuroleagueClient({
  competition: "euroleague", // or "eurocup"
  timeoutMs: 60_000,
  retries: 0,
  fetch: customFetch,
})`}</code>
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>
            Fifteen namespaced resources on <code>EuroleagueClient</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Key methods</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RESOURCE_NAMES.map((resource) => (
                <TableRow key={resource}>
                  <TableCell className="font-mono text-xs">
                    client.{resource}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {RESOURCE_SUMMARY[resource]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Errors</CardTitle>
          <CardDescription>
            The SDK exports typed errors for HTTP, network, timeout, schema, and
            validation failures.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Import from <code>euroleague-api</code>:{" "}
            <code>EuroleagueApiError</code>, <code>EuroleagueNetworkError</code>
            , <code>EuroleagueTimeoutError</code>,{" "}
            <code>EuroleagueSchemaError</code>,{" "}
            <code>EuroleagueValidationError</code>.
          </p>
          <p>
            Use the <strong>Playground</strong> tab to trigger real API calls and
            inspect responses. For TanStack Query patterns used in this demo, see{" "}
            <code>src/lib/hooks.ts</code> in the repository.
          </p>
          <p>
            <a
              className="underline underline-offset-2"
              href="https://github.com/aimon7/euroleague-api#readme"
              target="_blank"
              rel="noreferrer"
            >
              Full README on GitHub
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
