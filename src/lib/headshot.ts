import type { ClubRosterMember, PersonProfile, PersonRegistration } from "euroleague-api"

type ImageHolder = { images?: { headshot?: string | null } | null } | null | undefined

/** Prefer season-registration photos; fall back to person-level headshots. */
export function resolveHeadshot(...sources: ImageHolder[]): string | undefined {
  for (const source of sources) {
    const url = source?.images?.headshot
    if (url) return url
  }
  return undefined
}

export function rosterMemberHeadshot(member: ClubRosterMember): string | undefined {
  return resolveHeadshot(member, member.person)
}

export function personHeadshot(
  registration: PersonRegistration | undefined,
  profile: PersonProfile,
): string | undefined {
  return resolveHeadshot(registration, profile)
}
