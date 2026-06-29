import { describe, expect, it } from "vitest"
import type { Round } from "euroleague-api"

import { latestPlayedRound } from "./hooks"

function round(
  n: number,
  phaseTypeCode: string,
  minGameStartDate: string,
  maxGameStartDate = minGameStartDate,
): Round {
  return {
    round: n,
    name: `Round ${n}`,
    phaseTypeCode,
    minGameStartDate,
    maxGameStartDate,
  }
}

describe("latestPlayedRound", () => {
  const now = new Date("2026-06-29T12:00:00")

  it("uses the latest played regular-season round, not playoff rounds", () => {
    const rounds: Round[] = [
      round(37, "RS", "2026-04-10T00:00:00", "2026-04-12T23:59:59"),
      round(38, "RS", "2026-04-17T00:00:00", "2026-04-19T23:59:59"),
      round(39, "PO", "2026-04-24T00:00:00", "2026-05-01T23:59:59"),
      round(47, "FF", "2026-05-23T00:00:00", "2026-05-25T23:59:59"),
    ]

    expect(latestPlayedRound(rounds, now)).toBe(38)
  })

  it("ignores future regular-season rounds", () => {
    const rounds: Round[] = [
      round(10, "RS", "2025-11-01T00:00:00", "2025-11-03T23:59:59"),
      round(11, "RS", "2026-09-01T00:00:00", "2026-09-03T23:59:59"),
    ]

    expect(latestPlayedRound(rounds, now)).toBe(10)
  })

  it("falls back to all rounds when no RS phase is present", () => {
    const rounds: Round[] = [
      round(1, "PO", "2026-01-01T00:00:00", "2026-01-03T23:59:59"),
      round(2, "PO", "2026-02-01T00:00:00", "2026-02-03T23:59:59"),
    ]

    expect(latestPlayedRound(rounds, now)).toBe(2)
  })

  it("uses the highest RS round when none have started yet", () => {
    const rounds: Round[] = [
      round(1, "RS", "2026-09-01T00:00:00", "2026-09-03T23:59:59"),
      round(2, "RS", "2026-09-08T00:00:00", "2026-09-10T23:59:59"),
      round(39, "PO", "2026-10-01T00:00:00", "2026-10-03T23:59:59"),
    ]

    expect(latestPlayedRound(rounds, now)).toBe(2)
  })
})
