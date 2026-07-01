import { describe, expect, it } from "vitest"

import {
  trueShootingPctFromInputs,
  withRollingTrueShooting,
} from "./player-efficiency-trend"

describe("player efficiency trend", () => {
  it("allows true shooting above 100 percent for high-value shooting games", () => {
    expect(trueShootingPctFromInputs(3, 1, 0)).toBe(150)
  })

  it("returns null true shooting when a player has no shooting possessions", () => {
    expect(trueShootingPctFromInputs(0, 0, 0)).toBeNull()
  })

  it("computes rolling true shooting from raw points and possessions", () => {
    const trend = withRollingTrueShooting([
      { points: 10, rawShootingPossessions: 5, rollingTrueShootingPct: null },
      { points: 0, rawShootingPossessions: 0, rollingTrueShootingPct: null },
      { points: 20, rawShootingPossessions: 20, rollingTrueShootingPct: null },
    ])

    expect(trend[0].rollingTrueShootingPct).toBe(100)
    expect(trend[1].rollingTrueShootingPct).toBe(100)
    expect(trend[2].rollingTrueShootingPct).toBe(60)
  })
})
