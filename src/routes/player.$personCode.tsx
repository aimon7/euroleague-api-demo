import { createFileRoute } from "@tanstack/react-router"

// Stub — fleshed out by the player-route work. Kept minimal so the route tree and
// typed links resolve.
export const Route = createFileRoute("/player/$personCode")({
  component: PlayerRoute,
})

function PlayerRoute() {
  const { personCode } = Route.useParams()
  return <div className="py-10 text-muted-foreground">Player {personCode}…</div>
}
