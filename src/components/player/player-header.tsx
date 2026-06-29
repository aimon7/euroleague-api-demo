import type { PersonProfile } from "euroleague-api"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { QueryError } from "@/components/app/query-error"

interface Props {
  profile: PersonProfile | undefined
  isPending: boolean
  isError: boolean
  error: unknown
  onRetry: () => void
}

function formatHeight(cm: number | null | undefined): string | null {
  if (!cm) return null
  const totalIn = Math.round(cm / 2.54)
  const ft = Math.floor(totalIn / 12)
  const inches = totalIn % 12
  return `${cm} cm (${ft}'${inches}")`
}

export function PlayerHeader({ profile, isPending, isError, error, onRetry }: Props) {
  if (isPending) return <Skeleton className="h-24 w-full rounded-xl" />
  if (isError) return <QueryError error={error} onRetry={onRetry} />
  if (!profile) return null

  const height = formatHeight(profile.height)
  const birth = profile.birthDate ? profile.birthDate.slice(0, 10) : null
  const country = profile.country?.name ?? profile.birthCountry?.name

  const meta = [country, birth, height, profile.weight ? `${profile.weight} kg` : null]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        <AvatarImage src={profile.images?.headshot ?? undefined} alt="" />
        <AvatarFallback className="text-lg">
          {profile.passportName?.slice(0, 2) ?? profile.code.slice(-2)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 space-y-1">
        <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
          {profile.passportName ?? profile.name}
        </h1>
        {meta ? <p className="text-sm text-muted-foreground">{meta}</p> : null}
      </div>
    </div>
  )
}
