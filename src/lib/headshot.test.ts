import { describe, expect, it } from "vitest"

import { personHeadshot, resolveHeadshot, rosterMemberHeadshot } from "./headshot"

describe("resolveHeadshot", () => {
  it("prefers the first source with a headshot", () => {
    expect(
      resolveHeadshot(
        { images: { headshot: "https://example.test/registration.png" } },
        { images: { headshot: "https://example.test/person.png" } },
      ),
    ).toBe("https://example.test/registration.png")
  })

  it("falls back to later sources", () => {
    expect(
      resolveHeadshot(
        { images: {} },
        { images: { headshot: "https://example.test/person.png" } },
      ),
    ).toBe("https://example.test/person.png")
  })

  it("returns undefined when no headshot exists", () => {
    expect(resolveHeadshot({ images: {} }, null, undefined)).toBeUndefined()
  })
})

describe("rosterMemberHeadshot", () => {
  it("uses registration images before person images", () => {
    expect(
      rosterMemberHeadshot({
        images: { headshot: "https://example.test/member.png" },
        person: { images: { headshot: "https://example.test/person.png" } },
      } as never),
    ).toBe("https://example.test/member.png")
  })
})

describe("personHeadshot", () => {
  it("uses season registration before profile", () => {
    expect(
      personHeadshot(
        { images: { headshot: "https://example.test/season.png" } } as never,
        { images: { headshot: "https://example.test/profile.png" } } as never,
      ),
    ).toBe("https://example.test/season.png")
  })
})
