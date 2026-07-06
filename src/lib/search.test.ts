import { describe, expect, it } from "vitest"

import { landingSearchSchema, buildLandingSearch, landingTab } from "./landing-search"
import { appSearchSchema, buildAppSearch } from "./search"
import { teamSearchSchema, buildTeamSearch, teamPanel, rosterSort } from "./team-search"

describe("appSearchSchema", () => {
  it("defaults competition and season", () => {
    const result = appSearchSchema.parse({})
    expect(result.competition).toBe("euroleague")
    expect(result.season).toBeGreaterThan(1990)
  })

  it("parses valid competition and season", () => {
    expect(appSearchSchema.parse({ competition: "eurocup", season: "2024" })).toEqual({
      competition: "eurocup",
      season: 2024,
    })
  })

  it("falls back on invalid values", () => {
    expect(appSearchSchema.parse({ competition: "invalid", season: "bad" })).toEqual({
      competition: "euroleague",
      season: expect.any(Number),
    })
  })
})

describe("landingSearchSchema", () => {
  it("accepts only standings as a non-default tab", () => {
    expect(
      landingSearchSchema.parse({
        competition: "euroleague",
        season: 2025,
        tab: "standings",
      }),
    ).toEqual({
      competition: "euroleague",
      season: 2025,
      tab: "standings",
    })
  })

  it("strips invalid tab values", () => {
    expect(
      landingSearchSchema.parse({
        competition: "euroleague",
        season: 2025,
        tab: "clubs",
      }),
    ).toEqual({
      competition: "euroleague",
      season: 2025,
    })
  })

  it("does not accept team panel params", () => {
    expect(
      landingSearchSchema.parse({
        competition: "euroleague",
        season: 2025,
        panel: "stats",
      }),
    ).toEqual({
      competition: "euroleague",
      season: 2025,
    })
  })
})

describe("teamSearchSchema", () => {
  it("accepts only stats as a non-default panel", () => {
    expect(
      teamSearchSchema.parse({
        competition: "euroleague",
        season: 2025,
        panel: "stats",
      }),
    ).toEqual({
      competition: "euroleague",
      season: 2025,
      panel: "stats",
    })
  })

  it("strips invalid panel values", () => {
    expect(
      teamSearchSchema.parse({
        competition: "euroleague",
        season: 2025,
        panel: "roster",
      }),
    ).toEqual({
      competition: "euroleague",
      season: 2025,
    })
  })

  it("does not accept landing tab params", () => {
    expect(
      teamSearchSchema.parse({
        competition: "euroleague",
        season: 2025,
        tab: "standings",
      }),
    ).toEqual({
      competition: "euroleague",
      season: 2025,
    })
  })

  it("accepts non-default roster sort values", () => {
    expect(
      teamSearchSchema.parse({
        competition: "euroleague",
        season: 2025,
        rosterSort: "name",
      }),
    ).toEqual({
      competition: "euroleague",
      season: 2025,
      rosterSort: "name",
    })
  })

  it("strips default and invalid roster sort values", () => {
    expect(
      teamSearchSchema.parse({
        competition: "euroleague",
        season: 2025,
        rosterSort: "position",
      }),
    ).toEqual({
      competition: "euroleague",
      season: 2025,
    })

    expect(
      teamSearchSchema.parse({
        competition: "euroleague",
        season: 2025,
        rosterSort: "invalid",
      }),
    ).toEqual({
      competition: "euroleague",
      season: 2025,
    })
  })
})

describe("buildAppSearch", () => {
  it("returns validated competition and season", () => {
    expect(buildAppSearch({ competition: "euroleague", season: 2025 })).toEqual({
      competition: "euroleague",
      season: 2025,
    })
  })
})

describe("buildLandingSearch", () => {
  it("omits default tab from the result", () => {
    expect(buildLandingSearch({ competition: "euroleague", season: 2025 })).toEqual({
      competition: "euroleague",
      season: 2025,
    })
  })

  it("keeps non-default tab", () => {
    expect(
      buildLandingSearch({ competition: "euroleague", season: 2025, tab: "standings" }),
    ).toEqual({
      competition: "euroleague",
      season: 2025,
      tab: "standings",
    })
  })
})

describe("buildTeamSearch", () => {
  it("omits default panel from the result", () => {
    expect(buildTeamSearch({ competition: "euroleague", season: 2025 })).toEqual({
      competition: "euroleague",
      season: 2025,
    })
  })

  it("keeps non-default panel", () => {
    expect(
      buildTeamSearch({ competition: "euroleague", season: 2025, panel: "stats" }),
    ).toEqual({
      competition: "euroleague",
      season: 2025,
      panel: "stats",
    })
  })

  it("omits default roster sort from the result", () => {
    expect(buildTeamSearch({ competition: "euroleague", season: 2025, rosterSort: "position" })).toEqual({
      competition: "euroleague",
      season: 2025,
    })
  })

  it("keeps non-default roster sort", () => {
    expect(
      buildTeamSearch({ competition: "euroleague", season: 2025, rosterSort: "jersey" }),
    ).toEqual({
      competition: "euroleague",
      season: 2025,
      rosterSort: "jersey",
    })
  })
})

describe("landingTab", () => {
  it("defaults to clubs", () => {
    expect(landingTab({})).toBe("clubs")
    expect(landingTab({ tab: "standings" })).toBe("standings")
  })
})

describe("teamPanel", () => {
  it("defaults to roster", () => {
    expect(teamPanel({})).toBe("roster")
    expect(teamPanel({ panel: "stats" })).toBe("stats")
  })
})

describe("rosterSort", () => {
  it("defaults to position", () => {
    expect(rosterSort({})).toBe("position")
    expect(rosterSort({ rosterSort: "name" })).toBe("name")
    expect(rosterSort({ rosterSort: "jersey" })).toBe("jersey")
  })
})
