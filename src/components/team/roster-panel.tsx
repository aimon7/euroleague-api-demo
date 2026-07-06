import { Link } from "@tanstack/react-router"
import type { ClubRosterMember, Competition } from "euroleague-api"

import { rosterMemberHeadshot } from "@/lib/headshot"
import { splitRoster, useRoster } from "@/lib/hooks"
import { buildPlayerSearch } from "@/lib/player-search"
import { PlayerPhoto } from "@/components/player/player-photo"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/app/query-error"

interface RosterPanelProps {
  competition: Competition
  season: number
  clubCode: string
}

const PLAYER_GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
const SECTION_HEADING = "text-xs font-medium tracking-wide text-muted-foreground uppercase"

export function RosterPanel({ competition, season, clubCode }: RosterPanelProps) {
  const roster = useRoster(competition, season, clubCode)

  if (roster.isPending) {
    return (
      <div className={PLAYER_GRID}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (roster.isError) {
    return <QueryError error={roster.error} onRetry={() => void roster.refetch()} />
  }

  const { players, staff } = splitRoster(roster.data)

  if (players.length === 0 && staff.length === 0) {
    return (
      <p className="py-10 text-sm text-muted-foreground">
        No roster is available for this club this season.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {players.length > 0 ? (
        <section className="space-y-3">
          <h2 className={SECTION_HEADING}>Players</h2>
          <div className={PLAYER_GRID}>
            {players.map((member) => (
              <PlayerCard
                key={member.person.code}
                member={member}
                competition={competition}
                season={season}
                clubCode={clubCode}
              />
            ))}
          </div>
        </section>
      ) : null}

      {staff.length > 0 ? (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className={SECTION_HEADING}>Staff</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {staff.map((member) => (
                <StaffCard key={member.person.code} member={member} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}

interface PlayerCardProps {
  member: ClubRosterMember
  competition: Competition
  season: number
  clubCode: string
}

function PlayerCard({ member, competition, season, clubCode }: PlayerCardProps) {
  const { person, dorsal, positionName } = member
  const position = positionName ?? ""
  const jersey = dorsal ?? ""

  return (
    <Link
      to="/player/$personCode"
      params={{ personCode: person.code }}
      search={buildPlayerSearch({ competition, season, club: clubCode })}
      className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <Card className="h-full transition-colors hover:bg-accent/40 hover:ring-ring/40">
        <CardContent className="flex flex-col items-center gap-2 text-center">
          <div className="relative">
            <PlayerPhoto
              src={rosterMemberHeadshot(member)}
              alt=""
              size="md"
              fallback={<span className="text-sm">{initials(person.name)}</span>}
            />
            {jersey !== "" ? (
              <Badge className="absolute -right-1 -bottom-1 size-6 justify-center rounded-full p-0 text-[0.7rem] tabular-nums ring-2 ring-card">
                {jersey}
              </Badge>
            ) : null}
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="truncate text-sm font-medium">{person.name}</div>
            {position !== "" ? (
              <div className="truncate text-xs text-muted-foreground">{position}</div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function StaffCard({ member }: { member: ClubRosterMember }) {
  const role = member.typeName ?? ""

  return (
    <Card size="sm">
      <CardContent className="flex items-center justify-between gap-2">
        <span className="truncate font-medium">{member.person.name}</span>
        {role !== "" ? (
          <Badge variant="secondary" className="shrink-0">
            {role}
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  )
}

/** Up to two uppercase initials from a person's name, for the avatar fallback. */
function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
  return letters === "" ? "?" : letters
}
