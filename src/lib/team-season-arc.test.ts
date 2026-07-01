import { describe, expect, it } from "vitest"
import type { BoxscoreStats, ScheduleGame } from "euroleague-api"

import { buildTeamSeasonArc } from "./team-season-arc"

function scheduleGame(
  gameCode: number,
  round: number,
  localCode: string,
  roadCode: string,
): ScheduleGame {
  return {
    gameCode,
    round,
    played: true,
    local: { club: { code: localCode, name: localCode } },
    road: { club: { code: roadCode, name: roadCode } },
  }
}

function total(points: number) {
  return {
    points,
    timePlayed: 2400,
    fieldGoalsMade2: 20,
    fieldGoalsMade3: 10,
    fieldGoalsAttempted2: 40,
    fieldGoalsAttempted3: 20,
    freeThrowsMade: 15,
    freeThrowsAttempted: 20,
    offensiveRebounds: 10,
    defensiveRebounds: 25,
    totalRebounds: 35,
    assistances: 18,
    steals: 6,
    turnovers: 12,
    blocksFavour: 3,
    foulsCommited: 20,
  }
}

function stats(localPoints: number, roadPoints: number): BoxscoreStats {
  return {
    local: { total: total(localPoints) },
    road: { total: total(roadPoints) },
  } as unknown as BoxscoreStats
}

describe("team season arc", () => {
  it("builds chronological margin and rolling net-rating points for either side", () => {
    const arc = buildTeamSeasonArc(
      [
        {
          game: scheduleGame(2, 2, "MAD", "OLY"),
          stats: stats(75, 80),
        },
        {
          game: scheduleGame(1, 1, "OLY", "IST"),
          stats: stats(85, 78),
        },
      ],
      "OLY",
    )

    expect(arc).toHaveLength(2)
    expect(arc.map((point) => point.gameCode)).toEqual([1, 2])
    expect(arc[0]).toMatchObject({
      margin: 7,
      opponent: "IST",
      result: "W",
    })
    expect(arc[1]).toMatchObject({
      margin: 5,
      opponent: "MAD",
      result: "W",
    })
    expect(arc[0].rollingNetRating).toBeCloseTo(9.9, 1)
    expect(arc[1].rollingNetRating).toBeCloseTo(8.5, 1)
  })
})
