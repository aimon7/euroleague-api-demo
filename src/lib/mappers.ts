import type { PlayerStat, Standing, TeamStat } from "euroleague-api"

// --- primitives -------------------------------------------------------------

/**
 * Stats/standings rows are flexible records whose nested `player`/`team`/`club`
 * objects are JSON-stringified by the SDK's shallow normalizer. Unpack them back
 * into objects; already-object values pass through.
 */
export function parseEntity<T>(value: unknown): T | null {
  if (value == null) return null
  if (typeof value === "object") return value as T
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }
  return null
}

export function num(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

/** Coerce API percentages like `"47.2%"` to the number `47.2`. */
export function pct(value: unknown): number {
  if (typeof value === "string") return num(value.replace("%", ""))
  return num(value)
}

// --- club references --------------------------------------------------------

export interface ClubRef {
  code: string
  name: string
  crest: string | null
}

interface RawClubLike {
  code?: string | null
  name?: string | null
  imageUrl?: string | null
  images?: { crest?: string | null; headshot?: string | null } | null
}

/** Normalize the several club-shapes the API returns into one `ClubRef`. */
export function parseClubRef(value: unknown): ClubRef | null {
  const raw = parseEntity<RawClubLike>(value)
  if (!raw?.code) return null
  return {
    code: String(raw.code),
    name: raw.name ? String(raw.name) : String(raw.code),
    crest: raw.imageUrl ?? raw.images?.crest ?? raw.images?.headshot ?? null,
  }
}

// --- canonical box-score totals ---------------------------------------------

/** Unit-agnostic box-score totals; the single input shape for advanced stats. */
export interface BoxTotals {
  gamesPlayed: number
  minutes: number
  points: number
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  threePointersMade: number
  threePointersAttempted: number
  freeThrowsMade: number
  freeThrowsAttempted: number
  offensiveRebounds: number
  defensiveRebounds: number
  totalRebounds: number
  assists: number
  steals: number
  turnovers: number
  blocks: number
  fouls: number
}

/** Adapter for `players.getStats` / `teams.getStats` rows (v3 "traditional" vocab). */
export function boxFromStatRow(row: Record<string, unknown>): BoxTotals {
  const fgm2 = num(row.twoPointersMade)
  const fgm3 = num(row.threePointersMade)
  const fga2 = num(row.twoPointersAttempted)
  const fga3 = num(row.threePointersAttempted)
  return {
    gamesPlayed: num(row.gamesPlayed),
    minutes: num(row.minutesPlayed),
    points: num(row.pointsScored),
    fieldGoalsMade: fgm2 + fgm3,
    fieldGoalsAttempted: fga2 + fga3,
    threePointersMade: fgm3,
    threePointersAttempted: fga3,
    freeThrowsMade: num(row.freeThrowsMade),
    freeThrowsAttempted: num(row.freeThrowsAttempted),
    offensiveRebounds: num(row.offensiveRebounds),
    defensiveRebounds: num(row.defensiveRebounds),
    totalRebounds: num(row.totalRebounds),
    assists: num(row.assists),
    steals: num(row.steals),
    turnovers: num(row.turnovers),
    blocks: num(row.blocks),
    fouls: num(row.foulsCommited),
  }
}

/** Adapter for `people.getSeasonStats`/`getCareerStats` lines (`accumulated`/`averagePerGame`). */
export function boxFromPersonLine(line: Record<string, unknown>): BoxTotals {
  return {
    gamesPlayed: num(line.gamesPlayed),
    minutes: num(line.timePlayed),
    points: num(line.points),
    fieldGoalsMade: num(line.fieldGoalsMadeTotal),
    fieldGoalsAttempted: num(line.fieldGoalsAttemptedTotal),
    threePointersMade: num(line.fieldGoalsMade3),
    threePointersAttempted: num(line.fieldGoalsAttempted3),
    freeThrowsMade: num(line.freeThrowsMade),
    freeThrowsAttempted: num(line.freeThrowsAttempted),
    offensiveRebounds: num(line.offensiveRebounds),
    defensiveRebounds: num(line.defensiveRebounds),
    totalRebounds: num(line.totalRebounds),
    assists: num(line.assistances),
    steals: num(line.steals),
    turnovers: num(line.turnovers),
    blocks: num(line.blocksFavour),
    fouls: num(line.foulsCommited),
  }
}

// --- view-model row mappers -------------------------------------------------

export interface StandingRow {
  position: number
  club: ClubRef | null
  gamesPlayed: number
  wins: number
  losses: number
  winPercentage: number
  pointsFor: number
  pointsAgainst: number
  pointsDifference: number
  homeRecord: string
  awayRecord: string
}

export function toStandingRow(row: Standing): StandingRow {
  return {
    position: num(row.position),
    club: parseClubRef(row.club),
    gamesPlayed: num(row.gamesPlayed),
    wins: num(row.gamesWon),
    losses: num(row.gamesLost),
    winPercentage: pct(row.winPercentage),
    pointsFor: num(row.pointsFor),
    pointsAgainst: num(row.pointsAgainst),
    pointsDifference: num(row.pointsDifference),
    homeRecord: typeof row.homeRecord === "string" ? row.homeRecord : "",
    awayRecord: typeof row.awayRecord === "string" ? row.awayRecord : "",
  }
}

export interface PlayerStatRow {
  rank: number
  code: string
  name: string
  headshot: string | null
  team: ClubRef | null
  gamesPlayed: number
  minutes: number
  points: number
  rebounds: number
  assists: number
  pir: number
}

interface RawPlayer {
  code?: string | null
  name?: string | null
  imageUrl?: string | null
  images?: { headshot?: string | null } | null
  team?: unknown
}

export function toPlayerStatRow(row: PlayerStat): PlayerStatRow {
  const player = parseEntity<RawPlayer>(row.player)
  return {
    rank: num(row.playerRanking),
    code: player?.code ? String(player.code) : "",
    name: player?.name ? String(player.name) : "",
    headshot: player?.imageUrl ?? player?.images?.headshot ?? null,
    team: parseClubRef(player?.team),
    gamesPlayed: num(row.gamesPlayed),
    minutes: num(row.minutesPlayed),
    points: num(row.pointsScored),
    rebounds: num(row.totalRebounds),
    assists: num(row.assists),
    pir: num(row.pir),
  }
}

export interface TeamStatRow {
  rank: number
  team: ClubRef | null
  gamesPlayed: number
  points: number
  rebounds: number
  assists: number
  pir: number
}

export function toTeamStatRow(row: TeamStat): TeamStatRow {
  return {
    rank: num(row.teamRanking),
    team: parseClubRef(row.team),
    gamesPlayed: num(row.gamesPlayed),
    points: num(row.pointsScored),
    rebounds: num(row.totalRebounds),
    assists: num(row.assists),
    pir: num(row.pir),
  }
}
