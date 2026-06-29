import type { UseQueryResult } from "@tanstack/react-query"
import type { Club } from "euroleague-api"
import { GlobeIcon, MapPinIcon, UserIcon } from "@phosphor-icons/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/app/query-error"

export function TeamHeader({ club }: { club: UseQueryResult<Club, Error> }) {
  if (club.isPending) {
    return <TeamHeaderSkeleton />
  }

  if (club.isError) {
    return <QueryError error={club.error} onRetry={() => void club.refetch()} />
  }

  const data = club.data
  const location = [data.city, data.country?.name].filter(Boolean).join(" · ")
  const abbreviation = data.abbreviatedName ?? ""

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Avatar className="size-16 rounded-xl sm:size-20">
        <AvatarImage src={data.images?.crest ?? undefined} alt="" />
        <AvatarFallback className="rounded-xl text-base font-medium">
          {data.code}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            {data.name}
          </h1>
          {abbreviation !== "" ? (
            <Badge variant="outline" className="font-mono">
              {abbreviation}
            </Badge>
          ) : null}
        </div>

        {location !== "" ? (
          <p className="text-sm text-muted-foreground">{location}</p>
        ) : null}

        <TeamMeta club={data} />
      </div>
    </header>
  )
}

function TeamMeta({ club }: { club: Club }) {
  const venue = club.venueCode ?? ""
  const president = club.president ?? ""
  const website = club.website ?? ""

  if (venue === "" && president === "" && website === "") {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {venue !== "" ? (
        <span className="inline-flex items-center gap-1">
          <MapPinIcon className="size-3.5" />
          {venue}
        </span>
      ) : null}
      {president !== "" ? (
        <span className="inline-flex items-center gap-1">
          <UserIcon className="size-3.5" />
          {president}
        </span>
      ) : null}
      {website !== "" ? (
        <a
          href={website}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline-offset-2 hover:text-foreground hover:underline"
        >
          <GlobeIcon className="size-3.5" />
          Website
        </a>
      ) : null}
    </div>
  )
}

function TeamHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Skeleton className="size-16 rounded-xl sm:size-20" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-52" />
      </div>
    </div>
  )
}
