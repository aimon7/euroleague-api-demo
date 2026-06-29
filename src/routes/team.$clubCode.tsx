import { createFileRoute } from "@tanstack/react-router"

// Stub — fleshed out by the team-route work. Kept minimal so the route tree and
// typed links resolve.
export const Route = createFileRoute("/team/$clubCode")({
  component: TeamRoute,
})

function TeamRoute() {
  const { clubCode } = Route.useParams()
  return <div className="py-10 text-muted-foreground">Team {clubCode}…</div>
}
