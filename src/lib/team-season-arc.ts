import type { ScheduleGame } from "euroleague-api"

import { num, parseClubRef } from "./mappers"
import type { ClubRef } from "./mappers"

type Side = "local" | "road"

export interface TeamSeasonArcPoint {
  round: number
  gameCode: number
  label: string
  tooltipLabel: string
  opponent: string
  result: "W" | "L"
  margin: number
  rollingMargin: number | null
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

function sideScore(game: ScheduleGame, side: Side): number {
  return num(record(game[side])?.score)
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function withRollingMargin(points: TeamSeasonArcPoint[]): TeamSeasonArcPoint[] {
  return points.map((point, index) => {
    const window = points.slice(Math.max(0, index - 2), index + 1)

    return {
      ...point,
      rollingMargin: round1(
        window.reduce((total, current) => total + current.margin, 0) / window.length,
      ),
    }
  })
}

export function buildTeamSeasonArc(
  games: ScheduleGame[],
  clubCode: string,
): TeamSeasonArcPoint[] {
  const points = games.flatMap((game): TeamSeasonArcPoint[] => {
    const side = sideForClub(game, clubCode)
    if (!side) return []

    const opponentSide: Side = side === "local" ? "road" : "local"
    const opponent = sideClub(game, opponentSide)
    const pointsFor = sideScore(game, side)
    const pointsAgainst = sideScore(game, opponentSide)
    const margin = pointsFor - pointsAgainst
    const round = num(game.round)
    const gameCode = scheduledGameCode(game)

    return [
      {
        round,
        gameCode,
        label: `R${round}`,
        tooltipLabel: `Round ${round} · ${side === "local" ? "vs" : "@"} ${opponent?.code ?? "TBD"} · ${pointsFor}-${pointsAgainst}`,
        opponent: opponent?.code ?? "TBD",
        result: margin >= 0 ? "W" : "L",
        margin,
        rollingMargin: null,
      },
    ]
  })

  return withRollingMargin(
    points.sort((a, b) => a.round - b.round || a.gameCode - b.gameCode),
  )
}
