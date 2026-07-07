import type { PersonProfile } from "euroleague-api"

import { num } from "@/lib/mappers"

// Small, pure formatting helpers shared by the player-route sections. Kept free
// of JSX so they're trivial to reason about and reuse.

/** Readable "First Last" passport spelling, falling back to the API's display name. */
export function personDisplayName(profile: PersonProfile): string {
  if (profile.passportName && profile.passportSurname) {
    return `${profile.passportName} ${profile.passportSurname}`
  }
  return profile.name
}

/** 1 October of the season start year — typical EuroLeague tip-off. */
export function seasonTipOffDate(season: number): Date {
  return new Date(season, 9, 1)
}

/** Whole years between `birthDate` and `asOf`, or null when the date is unusable. */
export function ageFromBirthDate(
  birthDate: string | null | undefined,
  asOf: Date = new Date(),
): number | null {
  if (!birthDate) return null
  const born = new Date(birthDate)
  if (Number.isNaN(born.getTime())) return null

  let age = asOf.getFullYear() - born.getFullYear()
  const monthDelta = asOf.getMonth() - born.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && asOf.getDate() < born.getDate())) {
    age -= 1
  }
  return age >= 0 && age < 130 ? age : null
}

/** A locale-formatted birth date (e.g. "Jan 6, 1990"), or null when unusable. */
export function formatBirthDate(birthDate: string | null | undefined): string | null {
  if (!birthDate) return null
  const date = new Date(birthDate)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/** Height in cm rendered as both metres and centimetres, e.g. "1.93 m · 193 cm". */
export function formatHeight(height: number | null | undefined): string | null {
  if (typeof height !== "number" || !Number.isFinite(height) || height <= 0) return null
  const metres = (height / 100).toFixed(2)
  return `${metres} m · ${Math.round(height)} cm`
}

export function formatWeight(weight: number | null | undefined): string | null {
  if (typeof weight !== "number" || !Number.isFinite(weight) || weight <= 0) return null
  return `${Math.round(weight)} kg`
}

/** The people endpoints report time played in seconds; show per-game minutes. */
export function secondsToMinutes(seconds: unknown): number {
  return num(seconds) / 60
}

/** One-decimal fixed string with a non-breaking handling of nullish input. */
export function oneDecimal(value: unknown): string {
  return num(value).toFixed(1)
}

/** Made/attempted as a whole-number percentage string, "—" when no attempts. */
export function shootingPct(made: unknown, attempted: unknown): string {
  const att = num(attempted)
  if (att <= 0) return "—"
  return `${((num(made) / att) * 100).toFixed(1)}%`
}
