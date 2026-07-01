import { describe, expect, it } from "vitest"

import { playerAdvancedStats } from "./advanced"
import {
  boxFromPersonLine,
  boxFromStatRow,
  boxFromTeamStatRow,
  groupPersonGamesByClub,
} from "./mappers"

const statRow = {
  gamesPlayed: 43,
  minutesPlayed: 1735,
  pointsScored: 3600,
  twoPointersMade: 900,
  twoPointersAttempted: 1600,
  threePointersMade: 400,
  threePointersAttempted: 1100,
  freeThrowsMade: 600,
  freeThrowsAttempted: 750,
  offensiveRebounds: 350,
  defensiveRebounds: 900,
  totalRebounds: 1250,
  assists: 800,
  steals: 300,
  turnovers: 450,
  blocks: 120,
  foulsCommited: 900,
}

describe("box-score stat row mappers", () => {
  it("keeps player stat minutes unchanged", () => {
    expect(boxFromStatRow(statRow).minutes).toBe(1735)
  })

  it("converts team game-clock minutes to player-minutes", () => {
    expect(boxFromTeamStatRow(statRow).minutes).toBe(8675)
  })

  it("converts people endpoint seconds to minutes", () => {
    expect(boxFromPersonLine({ timePlayed: 1500 }).minutes).toBe(25)
  })
})

describe("person game grouping", () => {
  const game = (
    playerClubCode: string | null,
    round: number,
    points: number,
    timePlayed: number,
  ) => ({
    playerClubCode,
    game: {
      round,
      local: { club: { code: "PAR", name: "Partizan" } },
      road: { club: { code: "OLY", name: "Olympiacos" } },
    },
    stats: {
      timePlayed,
      points,
      fieldGoalsMadeTotal: 1,
      fieldGoalsAttemptedTotal: 2,
      fieldGoalsMade3: 1,
      fieldGoalsAttempted3: 1,
      freeThrowsMade: 2,
      freeThrowsAttempted: 2,
      offensiveRebounds: 1,
      defensiveRebounds: 2,
      totalRebounds: 3,
      assistances: 4,
      steals: 1,
      turnovers: 1,
      blocksFavour: 1,
      foulsCommited: 2,
    },
  })

  it("sums player games by club code and sorts latest stint first", () => {
    const stints = groupPersonGamesByClub([
      game("PAR", 1, 10, 1200),
      game("OLY", 20, 8, 900),
      game("PAR", 2, 12, 1500),
      game(null, 3, 99, 600),
    ] as Parameters<typeof groupPersonGamesByClub>[0])

    expect(stints).toHaveLength(2)
    expect(stints[0].club.code).toBe("OLY")
    expect(stints[0].box.gamesPlayed).toBe(1)
    expect(stints[0].box.points).toBe(8)
    expect(stints[0].box.minutes).toBe(15)

    expect(stints[1].club).toMatchObject({ code: "PAR", name: "Partizan" })
    expect(stints[1].box.gamesPlayed).toBe(2)
    expect(stints[1].box.points).toBe(22)
    expect(stints[1].box.minutes).toBe(45)
  })
})

describe("advanced stat mapper integration", () => {
  it("feeds team player-minutes into Usage %", () => {
    const playerRow = {
      ...statRow,
      gamesPlayed: 43,
      minutesPlayed: 1082.15,
      pointsScored: 684,
      twoPointersMade: 117,
      twoPointersAttempted: 225,
      threePointersMade: 107,
      threePointersAttempted: 277,
      freeThrowsMade: 127,
      freeThrowsAttempted: 161,
      offensiveRebounds: 21,
      defensiveRebounds: 77,
      totalRebounds: 98,
      assists: 110,
      steals: 31,
      turnovers: 82,
      blocks: 5,
      foulsCommited: 90,
    }

    const teamRow = {
      ...statRow,
      gamesPlayed: 43,
      minutesPlayed: 1735,
      pointsScored: 3891,
      twoPointersMade: 906,
      twoPointersAttempted: 1526,
      threePointersMade: 432,
      threePointersAttempted: 1195,
      freeThrowsMade: 783,
      freeThrowsAttempted: 1002,
      offensiveRebounds: 508,
      defensiveRebounds: 1102,
      totalRebounds: 1610,
      assists: 921,
      steals: 268,
      turnovers: 531,
      blocks: 97,
      foulsCommited: 800,
    }

    const stats = playerAdvancedStats(
      boxFromStatRow(playerRow),
      boxFromTeamStatRow(teamRow),
      boxFromTeamStatRow(teamRow),
    )

    expect(stats.find((stat) => stat.key === "usg")?.value).toBeCloseTo(28.4, 1)
  })
})
