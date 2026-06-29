import { useQuery } from "@tanstack/react-query"
import type {
  Club,
  ClubRosterMember,
  Competition,
  PeoplePhaseType,
  PersonProfile,
  PersonStats,
  PlayerStat,
  Round,
  Standing,
  StandingsType,
  TeamStat,
  PlayerStatsType,
  TeamStatsType,
  PlayerStatsMode,
  TeamStatsMode,
} from "euroleague-api"

import { getClient, seasonLabel } from "./euroleague"
import { keys } from "./keys"

export interface SeasonOption {
  year: number
  label: string
}

const DAY = 1000 * 60 * 60 * 24

/** Available seasons for the competition, newest first, for the season picker. */
export function useSeasons(competition: Competition) {
  return useQuery({
    queryKey: keys.seasons(competition),
    queryFn: () => getClient(competition).seasons.list(),
    staleTime: DAY,
    select: (seasons): SeasonOption[] => {
      const years = seasons
        .map((s) => s.year ?? Number.parseInt(s.code.replace(/\D/g, ""), 10))
        .filter((year): year is number => Number.isFinite(year))
      return [...new Set(years)]
        .sort((a, b) => b - a)
        .map((year) => ({ year, label: seasonLabel(year) }))
    },
  })
}

/** All clubs registered for the season. */
export function useClubs(competition: Competition, season: number) {
  return useQuery({
    queryKey: keys.clubs(competition, season),
    queryFn: (): Promise<Club[]> => getClient(competition).clubs.list({ season }),
    staleTime: DAY,
  })
}

/** Rounds for the season; used to resolve the latest round with results. */
export function useRounds(competition: Competition, season: number) {
  return useQuery({
    queryKey: keys.rounds(competition, season),
    queryFn: (): Promise<Round[]> => getClient(competition).rounds.list({ season }),
    staleTime: DAY,
  })
}

export function useClub(competition: Competition, season: number, clubCode: string) {
  return useQuery({
    queryKey: keys.club(competition, season, clubCode),
    queryFn: (): Promise<Club> => getClient(competition).clubs.get({ season, clubCode }),
    staleTime: DAY,
    enabled: clubCode.length > 0,
  })
}

export function useRoster(competition: Competition, season: number, clubCode: string) {
  return useQuery({
    queryKey: keys.roster(competition, season, clubCode),
    queryFn: (): Promise<ClubRosterMember[]> =>
      getClient(competition).clubs.getRoster({ season, clubCode }),
    staleTime: DAY,
    enabled: clubCode.length > 0,
  })
}

export function useStandings(
  competition: Competition,
  season: number,
  round: number,
  type: StandingsType = "basicstandings",
) {
  return useQuery({
    queryKey: keys.standings(competition, season, round, type),
    queryFn: (): Promise<Standing[]> =>
      getClient(competition).standings.getRound({ season, round, type }),
    enabled: round > 0,
  })
}

export function useTeamStats(
  competition: Competition,
  season: number,
  type: TeamStatsType = "traditional",
  mode: TeamStatsMode = "Accumulated",
) {
  return useQuery({
    queryKey: [...keys.teamStats(competition, season, type), mode] as const,
    queryFn: (): Promise<TeamStat[]> =>
      getClient(competition).teams.getStats({ season, type, mode }),
  })
}

export function usePlayerStats(
  competition: Competition,
  season: number,
  type: PlayerStatsType = "traditional",
  mode: PlayerStatsMode = "Accumulated",
) {
  return useQuery({
    queryKey: [...keys.playerStats(competition, season, type), mode] as const,
    queryFn: (): Promise<PlayerStat[]> =>
      getClient(competition).players.getStats({ season, type, mode }),
  })
}

export function usePersonProfile(competition: Competition, personCode: string) {
  return useQuery({
    queryKey: keys.personProfile(competition, personCode),
    queryFn: (): Promise<PersonProfile> =>
      getClient(competition).people.getProfile({ personCode }),
    staleTime: DAY,
    enabled: personCode.length > 0,
  })
}

export function usePersonSeasonStats(
  competition: Competition,
  personCode: string,
  season: number,
  phase?: PeoplePhaseType,
) {
  return useQuery({
    queryKey: keys.personSeasonStats(competition, personCode, season, phase),
    queryFn: (): Promise<PersonStats> =>
      getClient(competition).people.getSeasonStats({ personCode, season, phase }),
    enabled: personCode.length > 0,
  })
}

export function usePersonCareerStats(
  competition: Competition,
  personCode: string,
  phase?: PeoplePhaseType,
) {
  return useQuery({
    queryKey: keys.personCareerStats(competition, personCode, phase),
    queryFn: (): Promise<PersonStats> =>
      getClient(competition).people.getCareerStats({ personCode, phase }),
    enabled: personCode.length > 0,
  })
}

// --- roster helpers ---------------------------------------------------------

export const ROSTER_PLAYER_TYPE = "Player"
const ROSTER_STAFF_EXCLUDE = new Set(["Unified_Score_Crew", "Team_Follower"])

export function splitRoster(members: ClubRosterMember[]) {
  const players = members.filter((m) => m.typeName === ROSTER_PLAYER_TYPE)
  const staff = members.filter(
    (m) =>
      m.typeName !== ROSTER_PLAYER_TYPE &&
      !(m.typeName ? ROSTER_STAFF_EXCLUDE.has(m.typeName) : true),
  )
  return { players, staff }
}

/** The latest round whose games have already started (for current standings). */
export function latestPlayedRound(rounds: Round[], now = new Date()): number {
  const nowMs = now.getTime()
  const played = rounds.filter((r) => {
    const date = r.maxGameStartDate ?? r.minGameStartDate
    return date != null && Date.parse(date) <= nowMs
  })
  const pool = played.length > 0 ? played : rounds
  return pool.reduce((max, r) => Math.max(max, r.round), 0)
}
