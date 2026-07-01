import type { PersonStats, PlayerStat, Standing, TeamStat } from "euroleague-api"

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

function emptyBox(gamesPlayed = 0): BoxTotals {
  return {
    gamesPlayed,
    minutes: 0,
    points: 0,
    fieldGoalsMade: 0,
    fieldGoalsAttempted: 0,
    threePointersMade: 0,
    threePointersAttempted: 0,
    freeThrowsMade: 0,
    freeThrowsAttempted: 0,
    offensiveRebounds: 0,
    defensiveRebounds: 0,
    totalRebounds: 0,
    assists: 0,
    steals: 0,
    turnovers: 0,
    blocks: 0,
    fouls: 0,
  }
}

function sumBoxes(a: BoxTotals, b: BoxTotals): BoxTotals {
  return {
    gamesPlayed: a.gamesPlayed + b.gamesPlayed,
    minutes: a.minutes + b.minutes,
    points: a.points + b.points,
    fieldGoalsMade: a.fieldGoalsMade + b.fieldGoalsMade,
    fieldGoalsAttempted: a.fieldGoalsAttempted + b.fieldGoalsAttempted,
    threePointersMade: a.threePointersMade + b.threePointersMade,
    threePointersAttempted: a.threePointersAttempted + b.threePointersAttempted,
    freeThrowsMade: a.freeThrowsMade + b.freeThrowsMade,
    freeThrowsAttempted: a.freeThrowsAttempted + b.freeThrowsAttempted,
    offensiveRebounds: a.offensiveRebounds + b.offensiveRebounds,
    defensiveRebounds: a.defensiveRebounds + b.defensiveRebounds,
    totalRebounds: a.totalRebounds + b.totalRebounds,
    assists: a.assists + b.assists,
    steals: a.steals + b.steals,
    turnovers: a.turnovers + b.turnovers,
    blocks: a.blocks + b.blocks,
    fouls: a.fouls + b.fouls,
  }
}

/** Adapter for stat rows whose minutes already represent player minutes. */
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

/**
 * Adapter for team stat rows. The SDK reports `minutesPlayed` as team game-clock
 * minutes, while advanced-stat formulas expect team player-minutes (`TmMP`).
 */
export function boxFromTeamStatRow(row: Record<string, unknown>): BoxTotals {
  const box = boxFromStatRow(row)
  return { ...box, minutes: box.minutes * 5 }
}

/**
 * Adapter for `people.getSeasonStats`/`getCareerStats` lines. Those endpoints
 * report `timePlayed` in seconds, while formulas expect minutes.
 */
export function boxFromPersonLine(
  line: Record<string, unknown>,
  gamesPlayed = num(line.gamesPlayed),
): BoxTotals {
  return {
    gamesPlayed,
    minutes: num(line.timePlayed) / 60,
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

type PersonGameStat = PersonStats["games"][number]

export interface PlayerClubStint {
  club: ClubRef
  box: BoxTotals
  latestRound: number
}

function clubFromPersonGame(entry: PersonGameStat, clubCode: string): ClubRef {
  const local = parseClubRef(entry.game.local.club)
  if (local?.code === clubCode) return local

  const road = parseClubRef(entry.game.road.club)
  if (road?.code === clubCode) return road

  return { code: clubCode, name: clubCode, crest: null }
}

/** Sum a player's per-game people stats into one box-score total per represented club. */
export function groupPersonGamesByClub(games: PersonGameStat[]): PlayerClubStint[] {
  const groups = new Map<string, PlayerClubStint>()

  for (const entry of games) {
    const clubCode =
      typeof entry.playerClubCode === "string" && entry.playerClubCode.length > 0
        ? entry.playerClubCode
        : null
    if (!clubCode) continue

    const current =
      groups.get(clubCode) ??
      ({
        club: clubFromPersonGame(entry, clubCode),
        box: emptyBox(),
        latestRound: 0,
      } satisfies PlayerClubStint)

    groups.set(clubCode, {
      ...current,
      box: sumBoxes(current.box, boxFromPersonLine(entry.stats, 1)),
      latestRound: Math.max(current.latestRound, num(entry.game.round)),
    })
  }

  return [...groups.values()].sort((a, b) => b.latestRound - a.latestRound)
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

/** Find a team's stats row by club code in an accumulated stats payload. */
export function findTeamStatRow(
  rows: TeamStat[] | undefined,
  clubCode: string,
): TeamStat | undefined {
  return rows?.find((row) => parseClubRef(row.team)?.code === clubCode)
}

/** Find a player's stats row by person code in an accumulated stats payload. */
export function findPlayerStatRow(
  rows: PlayerStat[] | undefined,
  personCode: string,
): PlayerStat | undefined {
  return rows?.find((row) => {
    const player = parseEntity<{ code?: string | null }>(row.player)
    return player?.code === personCode
  })
}
