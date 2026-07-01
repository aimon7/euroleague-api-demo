import { describe, expect, it } from "vitest"
import type { ScheduleGame } from "euroleague-api"

import { buildTeamSeasonArc } from "./team-season-arc"

function scheduleGame(
  gameCode: number,
  round: number,
  localCode: string,
  roadCode: string,
  localScore: number,
  roadScore: number,
): ScheduleGame {
  return {
    gameCode,
    round,
    played: true,
    local: { club: { code: localCode, name: localCode }, score: localScore },
    road: { club: { code: roadCode, name: roadCode }, score: roadScore },
  }
}

describe("team season arc", () => {
  it("builds chronological margin and rolling margin points for either side", () => {
    const arc = buildTeamSeasonArc(
      [
        scheduleGame(2, 2, "MAD", "OLY", 75, 80),
        scheduleGame(1, 1, "OLY", "IST", 85, 78),
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
    expect(arc[0].rollingMargin).toBe(7)
    expect(arc[1].rollingMargin).toBe(6)
  })
})
