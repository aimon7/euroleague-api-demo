import type { BoxscoreStats, ScheduleGame } from "euroleague-api"

import {
  defensiveRating,
  offensiveRating,
  teamPossessions,
} from "./advanced/formulas"
import { num, parseClubRef } from "./mappers"
import type { BoxTotals, ClubRef } from "./mappers"

type Side = "local" | "road"

export interface TeamGameStats {
  game: ScheduleGame
  stats: BoxscoreStats
}

export interface TeamSeasonArcPoint {
  round: number
  gameCode: number
  label: string
  tooltipLabel: string
  opponent: string
  result: "W" | "L"
  margin: number
  offensiveRating: number
  defensiveRating: number
  netRating: number
  rollingNetRating: number | null
}

type TeamSeasonArcWorkingPoint = TeamSeasonArcPoint & {
  pointsFor: number
  pointsAgainst: number
  possessions: number
}

function record(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === "object" ? (value as Record<string, unknown>) : null
}

function sideClub(game: ScheduleGame, side: Side): ClubRef | null {
  return parseClubRef(record(game[side])?.club)
}

function sideForClub(game: ScheduleGame, clubCode: string): Side | null {
  if (sideClub(game, "local")?.code === clubCode) return "local"
  if (sideClub(game, "road")?.code === clubCode) return "road"
  return null
}

export function scheduledGameCode(game: ScheduleGame): number {
  return num(game.gameCode)
}

export function scheduledGameInvolvesClub(game: ScheduleGame, clubCode: string): boolean {
  return sideForClub(game, clubCode) !== null
}

export function scheduledGameWasPlayed(game: ScheduleGame): boolean {
  return Boolean(game.played) && scheduledGameCode(game) > 0
}

function boxFromGameTotal(total: Record<string, unknown>): BoxTotals {
  const twoPointersMade = num(total.fieldGoalsMade2)
  const threePointersMade = num(total.fieldGoalsMade3)
  const twoPointersAttempted = num(total.fieldGoalsAttempted2)
  const threePointersAttempted = num(total.fieldGoalsAttempted3)

  return {
    gamesPlayed: 1,
    minutes: (num(total.timePlayed) / 60) * 5,
    points: num(total.points),
    fieldGoalsMade: twoPointersMade + threePointersMade,
    fieldGoalsAttempted: twoPointersAttempted + threePointersAttempted,
    threePointersMade,
    threePointersAttempted,
    freeThrowsMade: num(total.freeThrowsMade),
    freeThrowsAttempted: num(total.freeThrowsAttempted),
    offensiveRebounds: num(total.offensiveRebounds),
    defensiveRebounds: num(total.defensiveRebounds),
    totalRebounds: num(total.totalRebounds),
    assists: num(total.assistances),
    steals: num(total.steals),
    turnovers: num(total.turnovers),
    blocks: num(total.blocksFavour),
    fouls: num(total.foulsCommited),
  }
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function withRollingNetRating(points: TeamSeasonArcWorkingPoint[]): TeamSeasonArcPoint[] {
  return points.map((point, index) => {
    const window = points.slice(Math.max(0, index - 2), index + 1)
    const pointsFor = window.reduce((total, current) => total + current.pointsFor, 0)
    const pointsAgainst = window.reduce((total, current) => total + current.pointsAgainst, 0)
    const possessions = window.reduce((total, current) => total + current.possessions, 0)

    return {
      round: point.round,
      gameCode: point.gameCode,
      label: point.label,
      tooltipLabel: point.tooltipLabel,
      opponent: point.opponent,
      result: point.result,
      margin: point.margin,
      offensiveRating: point.offensiveRating,
      defensiveRating: point.defensiveRating,
      netRating: point.netRating,
      rollingNetRating:
        possessions === 0 ? 0 : round1(((pointsFor - pointsAgainst) / possessions) * 100),
    }
  })
}

export function buildTeamSeasonArc(
  games: TeamGameStats[],
  clubCode: string,
): TeamSeasonArcPoint[] {
  const points = games.flatMap(({ game, stats }): TeamSeasonArcWorkingPoint[] => {
    const side = sideForClub(game, clubCode)
    if (!side) return []

    const opponentSide: Side = side === "local" ? "road" : "local"
    const opponent = sideClub(game, opponentSide)
    const team = boxFromGameTotal(stats[side].total)
    const opponentBox = boxFromGameTotal(stats[opponentSide].total)
    const possessions = teamPossessions(team, opponentBox)
    const ortg = offensiveRating(team, opponentBox)
    const drtg = defensiveRating(team, opponentBox)
    const margin = team.points - opponentBox.points
    const round = num(game.round)
    const gameCode = scheduledGameCode(game)

    return [
      {
        round,
        gameCode,
        label: `R${round}`,
        tooltipLabel: `Round ${round} · ${side === "local" ? "vs" : "@"} ${opponent?.code ?? "TBD"} · ${team.points}-${opponentBox.points}`,
        opponent: opponent?.code ?? "TBD",
        result: margin >= 0 ? "W" : "L",
        margin,
        offensiveRating: round1(ortg),
        defensiveRating: round1(drtg),
        netRating: round1(ortg - drtg),
        rollingNetRating: null,
        pointsFor: team.points,
        pointsAgainst: opponentBox.points,
        possessions,
      },
    ]
  })

  return withRollingNetRating(
    points.sort((a, b) => a.round - b.round || a.gameCode - b.gameCode),
  )
}
