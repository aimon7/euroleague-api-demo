import type { ClubRosterMember } from "euroleague-api"
import { describe, expect, it } from "vitest"

import { sortRosterPlayers } from "./roster-sort"

function player(
  overrides: Partial<ClubRosterMember> & { code: string; name: string },
): ClubRosterMember {
  const { code, name, ...rest } = overrides
  return {
    person: { code, name },
    type: "J",
    typeName: "Player",
    ...rest,
  } as ClubRosterMember
}

describe("sortRosterPlayers", () => {
  const roster = [
    player({ code: "1", name: "SMITH, JOHN", dorsal: "10", position: 3, positionName: "Center" }),
    player({ code: "2", name: "ADAMS, MIKE", dorsal: "5", position: 1, positionName: "Guard" }),
    player({ code: "3", name: "BROWN, JAY", dorsal: "23", position: 2, positionName: "Forward" }),
    player({ code: "4", name: "CLARK, TOM", dorsal: "", position: 1, positionName: "Guard" }),
    player({ code: "5", name: "DAVIS, ANN", dorsal: "88", position: -1, positionName: null }),
  ]

  it("sorts by position (Guard → Forward → Center), then jersey, then name", () => {
    const sorted = sortRosterPlayers(roster, "position")
    expect(sorted.map((m) => m.person.code)).toEqual(["2", "4", "3", "1", "5"])
  })

  it("sorts by name alphabetically, jersey as tie-breaker", () => {
    const sorted = sortRosterPlayers(roster, "name")
    expect(sorted.map((m) => m.person.name)).toEqual([
      "ADAMS, MIKE",
      "BROWN, JAY",
      "CLARK, TOM",
      "DAVIS, ANN",
      "SMITH, JOHN",
    ])
  })

  it("sorts by jersey number, missing jerseys last", () => {
    const sorted = sortRosterPlayers(roster, "jersey")
    expect(sorted.map((m) => m.dorsal)).toEqual(["5", "10", "23", "88", ""])
  })

  it("does not mutate the input array", () => {
    const copy = [...roster]
    void sortRosterPlayers(roster, "name")
    expect(roster).toEqual(copy)
  })
})
