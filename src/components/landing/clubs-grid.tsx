import { Link } from "@tanstack/react-router"
import type { Competition } from "euroleague-api"

import { useClubs } from "@/lib/hooks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/app/query-error"

interface Props {
  competition: Competition
  season: number
}

const GRID = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

export function ClubsGrid({ competition, season }: Props) {
  const { data, isPending, isError, error, refetch } = useClubs(competition, season)

  if (isPending) {
    return (
      <div className={GRID}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return <QueryError error={error} onRetry={() => void refetch()} />
  }

  if (data.length === 0) {
    return <p className="py-10 text-sm text-muted-foreground">No clubs for this season.</p>
  }

  return (
    <div className={GRID}>
      {data.map((club) => (
        <Link
          key={club.code}
          to="/team/$clubCode"
          params={{ clubCode: club.code }}
          search={{ competition, season }}
          className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <Card className="h-full py-0 transition-colors hover:border-ring hover:bg-accent/40">
            <CardContent className="flex items-center gap-3 p-4">
              <Avatar className="size-12 rounded-md">
                <AvatarImage src={club.images?.crest ?? undefined} alt="" />
                <AvatarFallback className="rounded-md text-xs">
                  {club.code}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate font-medium">{club.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {[club.city, club.country?.name].filter(Boolean).join(" · ")}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
