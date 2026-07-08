import { describe, expect, it } from "vitest"
import type { BoxTotals } from "../mappers"
import * as f from "./formulas"
import { playerAdvancedStats } from "./player"
import { teamAdvancedStats } from "./team"

const player: BoxTotals = {
  gamesPlayed: 10,
  minutes: 300,
  points: 200,
  fieldGoalsMade: 70,
  fieldGoalsAttempted: 150,
  threePointersMade: 30,
  threePointersAttempted: 80,
  freeThrowsMade: 30,
  freeThrowsAttempted: 40,
  offensiveRebounds: 10,
  defensiveRebounds: 40,
  totalRebounds: 50,
  assists: 50,
  steals: 15,
  turnovers: 30,
  blocks: 5,
  fouls: 25,
}

const team: BoxTotals = {
  gamesPlayed: 10,
  minutes: 2000,
  points: 1900,
  fieldGoalsMade: 700,
  fieldGoalsAttempted: 1500,
  threePointersMade: 200,
  threePointersAttempted: 600,
  freeThrowsMade: 300,
  freeThrowsAttempted: 400,
  offensiveRebounds: 120,
  defensiveRebounds: 300,
  totalRebounds: 420,
  assists: 450,
  steals: 70,
  turnovers: 300,
  blocks: 40,
  fouls: 200,
}

const opp: BoxTotals = {
  gamesPlayed: 10,
  minutes: 2000,
  points: 1850,
  fieldGoalsMade: 690,
  fieldGoalsAttempted: 1480,
  threePointersMade: 190,
  threePointersAttempted: 560,
  freeThrowsMade: 290,
  freeThrowsAttempted: 380,
  offensiveRebounds: 110,
  defensiveRebounds: 290,
  totalRebounds: 400,
  assists: 430,
  steals: 65,
  turnovers: 320,
  blocks: 35,
  fouls: 210,
}

describe("player rate metrics", () => {
  it("matches hand-computed values", () => {
    expect(f.trueShootingPct(player)).toBeCloseTo(59.666, 2)
    expect(f.effectiveFieldGoalPct(player)).toBeCloseTo(56.667, 2)
    expect(f.threePointAttemptRate(player)).toBeCloseTo(0.5333, 3)
    expect(f.freeThrowRate(player)).toBeCloseTo(0.2667, 3)
    expect(f.turnoverPct(player)).toBeCloseTo(15.182, 2)
    expect(f.usagePct(player, team)).toBeCloseTo(13.333, 2)
    expect(f.assistPct(player, team)).toBeCloseTo(10.989, 2)
    expect(f.offensiveReboundPct(player, team, opp)).toBeCloseTo(3.252, 2)
    expect(f.defensiveReboundPct(player, team, opp)).toBeCloseTo(13.008, 2)
    expect(f.totalReboundPct(player, team, opp)).toBeCloseTo(8.13, 2)
    expect(f.stealPct(player, team, opp)).toBeCloseTo(1.0769, 3)
    expect(f.blockPct(player, team, opp)).toBeCloseTo(0.7246, 3)
    expect(f.gameScorePerGame(player)).toBeCloseTo(15.15, 2)
    expect(f.assistToTurnoverRatio(player)).toBeCloseTo(1.667, 2)
    expect(f.stlBlkPer40(player)).toBeCloseTo(2.667, 2)
    expect(f.pirPer40(200, 18_000)).toBeCloseTo(26.667, 2)
    expect(f.starterRate(8, 10)).toBeCloseTo(80, 2)
  })

  it("never divides by zero", () => {
    const empty = { ...player, fieldGoalsAttempted: 0, freeThrowsAttempted: 0, minutes: 0 }
    expect(f.trueShootingPct(empty)).toBe(0)
    expect(f.effectiveFieldGoalPct(empty)).toBe(0)
    expect(f.usagePct(empty, team)).toBe(0)
  })
})

describe("team ratings", () => {
  it("matches hand-computed values", () => {
    expect(f.pace(team, opp)).toBeCloseTo(185.66, 1)
    expect(f.offensiveRating(team, opp)).toBeCloseTo(102.34, 1)
    expect(f.defensiveRating(team, opp)).toBeCloseTo(99.645, 1)
    expect(f.teamTurnoverPct(team, opp)).toBeCloseTo(16.159, 2)
    expect(f.teamOffensiveReboundPct(team, opp)).toBeCloseTo(29.268, 2)
    expect(f.teamFreeThrowRate(team)).toBeCloseTo(0.2, 3)
    expect(f.assistToTurnoverRatio(team)).toBeCloseTo(1.5, 2)
  })
})

describe("assembled advanced stats", () => {
  it("marks every player metric as computed", () => {
    const stats = playerAdvancedStats(player, team, opp)
    expect(stats).toHaveLength(15)
    expect(stats.every((s) => s.source === "computed")).toBe(true)
    expect(stats.find((s) => s.key === "ts")?.value).toBeCloseTo(59.666, 2)
    expect(stats.find((s) => s.key === "astto")?.value).toBeCloseTo(1.667, 2)
    expect(stats.find((s) => s.key === "stlblk40")?.value).toBeCloseTo(2.667, 2)
  })

  it("prefers an API value when present and marks it as api", () => {
    const withApi = teamAdvancedStats(team, opp, {
      effectiveFieldGoalPercentage: "60.0%",
      assistsToTurnoversRatio: "1.42",
      defensiveReboundsPercentage: "72.5%",
      reboundsPercentage: "51.0%",
      assistsRatio: "18.5%",
      turnoversRatio: "12.3%",
      twoPointRate: "0.55",
      threePointRate: "0.45",
      pointsFromTwoPointersPercentage: "48.0%",
      pointsFromThreePointersPercentage: "32.0%",
      pointsFromFreeThrowsPercentage: "20.0%",
    })
    const efg = withApi.find((s) => s.key === "efg")
    expect(efg?.source).toBe("api")
    expect(efg?.value).toBeCloseTo(60, 3)

    const astto = withApi.find((s) => s.key === "astto")
    expect(astto?.source).toBe("api")
    expect(astto?.value).toBeCloseTo(1.42, 2)

    const dreb = withApi.find((s) => s.key === "dreb")
    expect(dreb?.source).toBe("api")
    expect(dreb?.value).toBeCloseTo(72.5, 1)

    expect(withApi).toHaveLength(19)

    const withoutApi = teamAdvancedStats(team, opp)
    const efgComputed = withoutApi.find((s) => s.key === "efg")
    expect(efgComputed?.source).toBe("computed")
    expect(efgComputed?.value).toBeCloseTo(53.333, 2)

    const asttoComputed = withoutApi.find((s) => s.key === "astto")
    expect(asttoComputed?.source).toBe("computed")
    expect(asttoComputed?.value).toBeCloseTo(1.5, 2)
  })
})
