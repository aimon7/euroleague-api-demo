import type { Competition } from "euroleague-api"
import {
  BarbellIcon,
  CakeIcon,
  MapPinIcon,
  RulerIcon,
  TShirtIcon,
} from "@phosphor-icons/react"

import { personHeadshot } from "@/lib/headshot"
import { usePersonProfile, usePersonSeasonRegistration } from "@/lib/hooks"
import { PlayerPhoto } from "@/components/player/player-photo"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/app/query-error"
import {
  ageFromBirthDate,
  formatBirthDate,
  seasonTipOffDate,
  formatHeight,
  formatWeight,
  personDisplayName,
} from "./format"

interface Props {
  competition: Competition
  personCode: string
  season: number
}

interface HeaderBadge {
  key: string
  icon: typeof MapPinIcon
  label: string
}

function initials(name: string): string {
  const parts = name.split(/[\s,]+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0].charAt(0)
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ""
  return (first + last).toUpperCase()
}

export function PlayerHeader({ competition, personCode, season }: Props) {
  const { data, isPending, isError, error, refetch } = usePersonProfile(
    competition,
    personCode
  )
  const registration = usePersonSeasonRegistration(competition, personCode, season)

  if (isPending) {
    return (
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
        <Skeleton className="h-32 w-24 rounded-lg sm:h-36 sm:w-28" />
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
      </div>
    )
  }

  if (isError) {
    return <QueryError error={error} onRetry={() => void refetch()} />
  }

  const displayName = personDisplayName(data)
  const country = data.country?.name ?? data.birthCountry?.name ?? null
  const age = ageFromBirthDate(data.birthDate, seasonTipOffDate(season))
  const height = formatHeight(data.height)
  const weight = formatWeight(data.weight)
  const birthDate = formatBirthDate(data.birthDate)

  const badges: HeaderBadge[] = []
  if (data.jerseyName && data.jerseyName.length > 0) {
    badges.push({ key: "jersey", icon: TShirtIcon, label: data.jerseyName })
  }
  if (country != null) {
    badges.push({ key: "country", icon: MapPinIcon, label: country })
  }
  if (age != null) {
    const born = birthDate != null ? ` · born ${birthDate}` : ""
    badges.push({ key: "age", icon: CakeIcon, label: `${age} yrs (season)${born}` })
  }
  if (height != null) {
    badges.push({ key: "height", icon: RulerIcon, label: height })
  }
  if (weight != null) {
    badges.push({ key: "weight", icon: BarbellIcon, label: weight })
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:text-left">
      <PlayerPhoto
        src={personHeadshot(registration.data, data)}
        alt={displayName}
        size="lg"
        fallback={<span className="text-xl font-medium">{initials(displayName)}</span>}
      />

      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl leading-none font-semibold tracking-tight sm:text-4xl">
          {displayName}
        </h1>
        {badges.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start">
            {badges.map((badge) => (
              <Badge key={badge.key} variant="secondary" className="gap-1">
                <badge.icon />
                {badge.label}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
