import type { Competition,
  PlayerStatsType,
  StandingsType,
  TeamStatsType,
  PeoplePhaseType } from "euroleague-api"

// Centralized query keys. Every key starts with the competition so EuroLeague and
// EuroCup data never collide in the cache.
export const keys = {
  root: (c: Competition) => ["euroleague", c] as const,

  seasons: (c: Competition) => [...keys.root(c), "seasons"] as const,
  rounds: (c: Competition, season: number) =>
    [...keys.root(c), "rounds", season] as const,

  clubs: (c: Competition, season: number) =>
    [...keys.root(c), "clubs", season] as const,
  club: (c: Competition, season: number, clubCode: string) =>
    [...keys.root(c), "club", season, clubCode] as const,
  roster: (c: Competition, season: number, clubCode: string) =>
    [...keys.root(c), "roster", season, clubCode] as const,

  standings: (c: Competition, season: number, round: number, type: StandingsType) =>
    [...keys.root(c), "standings", season, round, type] as const,

  teamSeasonArc: (c: Competition, season: number, clubCode: string) =>
    [...keys.root(c), "team-season-arc", season, clubCode] as const,
  teamStats: (c: Competition, season: number, type: TeamStatsType) =>
    [...keys.root(c), "team-stats", season, type] as const,
  playerStats: (c: Competition, season: number, type: PlayerStatsType) =>
    [...keys.root(c), "player-stats", season, type] as const,

  personProfile: (c: Competition, personCode: string) =>
    [...keys.root(c), "person", personCode, "profile"] as const,
  personSeasonRegistration: (c: Competition, personCode: string, season: number) =>
    [...keys.root(c), "person", personCode, "season-registration", season] as const,
  personSeasonStats: (
    c: Competition,
    personCode: string,
    season: number,
    phase?: PeoplePhaseType,
  ) => [...keys.root(c), "person", personCode, "season-stats", season, phase ?? "ALL"] as const,
  personCareerStats: (c: Competition, personCode: string, phase?: PeoplePhaseType) =>
    [...keys.root(c), "person", personCode, "career-stats", phase ?? "ALL"] as const,
}
