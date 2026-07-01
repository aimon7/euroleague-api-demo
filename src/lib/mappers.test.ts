import { describe, expect, it } from "vitest"

import { playerAdvancedStats } from "./advanced"
import { boxFromStatRow, boxFromTeamStatRow } from "./mappers"

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
