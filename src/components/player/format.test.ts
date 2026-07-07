import { describe, expect, it } from "vitest"

import { ageFromBirthDate, seasonTipOffDate } from "./format"

describe("seasonTipOffDate", () => {
  it("returns 1 October of the season start year", () => {
    const date = seasonTipOffDate(2000)
    expect(date.getFullYear()).toBe(2000)
    expect(date.getMonth()).toBe(9)
    expect(date.getDate()).toBe(1)
  })
})

describe("ageFromBirthDate", () => {
  it("uses season tip-off when a reference date is passed", () => {
    const birthDate = "1967-04-24T00:00:00"
    expect(ageFromBirthDate(birthDate, seasonTipOffDate(2000))).toBe(33)
  })

  it("subtracts a year when the birthday is after tip-off", () => {
    const birthDate = "1967-11-15T00:00:00"
    expect(ageFromBirthDate(birthDate, seasonTipOffDate(2000))).toBe(32)
  })

  it("returns null for missing or invalid birth dates", () => {
    expect(ageFromBirthDate(null, seasonTipOffDate(2000))).toBeNull()
    expect(ageFromBirthDate("not-a-date", seasonTipOffDate(2000))).toBeNull()
  })
})
