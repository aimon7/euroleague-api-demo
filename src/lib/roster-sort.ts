import type { ClubRosterMember } from "euroleague-api"

import type { RosterSort } from "./team-search"

function jerseyNumber(member: ClubRosterMember): number | null {
  const raw = member.dorsal
  if (raw == null || raw === "") return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function positionKey(member: ClubRosterMember): number {
  const pos = member.position
  if (pos == null || pos < 0) return Number.POSITIVE_INFINITY
  return pos
}

function compareJersey(a: ClubRosterMember, b: ClubRosterMember): number {
  const ja = jerseyNumber(a)
  const jb = jerseyNumber(b)
  if (ja == null && jb == null) return 0
  if (ja == null) return 1
  if (jb == null) return -1
  return ja - jb
}

function compareName(a: ClubRosterMember, b: ClubRosterMember): number {
  return a.person.name.localeCompare(b.person.name)
}

/** Returns a new array sorted by the chosen roster key (never mutates the input). */
export function sortRosterPlayers(
  players: ClubRosterMember[],
  sort: RosterSort,
): ClubRosterMember[] {
  const sorted = [...players]

  switch (sort) {
    case "position":
      sorted.sort((a, b) => {
        const byPosition = positionKey(a) - positionKey(b)
        if (byPosition !== 0) return byPosition
        const byJersey = compareJersey(a, b)
        if (byJersey !== 0) return byJersey
        return compareName(a, b)
      })
      break
    case "name":
      sorted.sort((a, b) => {
        const byName = compareName(a, b)
        if (byName !== 0) return byName
        return compareJersey(a, b)
      })
      break
    case "jersey":
      sorted.sort((a, b) => {
        const byJersey = compareJersey(a, b)
        if (byJersey !== 0) return byJersey
        return compareName(a, b)
      })
      break
  }

  return sorted
}
