import { Link } from "@tanstack/react-router"
import type { ClubRosterMember, Competition } from "euroleague-api"

import { rosterMemberHeadshot } from "@/lib/headshot"
import { splitRoster } from "@/lib/hooks"
import { buildPlayerSearch } from "@/lib/player-search"
import { PlayerPhoto } from "@/components/player/player-photo"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/app/query-error"

interface Props {
  competition: Competition
  season: number
  clubCode: string
  members: ClubRosterMember[] | undefined
  isPending: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
}

export function TeamRoster({
  competition,
  season,
  clubCode,
  members,
  isPending,
  isError,
  error,
  onRetry,
}: Props) {
  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }
  if (isError) return <QueryError error={error} onRetry={onRetry} />
  if (!members?.length) {
    return <p className="text-sm text-muted-foreground">No roster data for this season.</p>
  }

  const { players, staff } = splitRoster(members)

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-medium">Players ({players.length})</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((member) => (
            <Link
              key={member.person.code}
              to="/player/$personCode"
              params={{ personCode: member.person.code }}
              search={buildPlayerSearch({ competition, season, club: clubCode })}
              className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Card className="h-full py-0 transition-colors hover:border-ring hover:bg-accent/40">
                <CardContent className="flex items-center gap-3 p-4">
                  <PlayerPhoto
                    src={rosterMemberHeadshot(member)}
                    alt=""
                    size="sm"
                    fallback={member.dorsal || member.person.code.slice(-2)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {member.dorsal ? <Badge variant="secondary">#{member.dorsal}</Badge> : null}
                      <span className="truncate font-medium">{member.person.name}</span>
                    </div>
                    {member.positionName ? (
                      <p className="truncate text-xs text-muted-foreground">{member.positionName}</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {staff.length > 0 ? (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="text-sm font-medium">Staff ({staff.length})</h2>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {staff.map((member) => (
                <li
                  key={`${member.person.code}-${member.typeName}`}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="font-medium">{member.person.name}</div>
                  <div className="text-xs text-muted-foreground">{member.typeName}</div>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  )
}
