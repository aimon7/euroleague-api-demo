import { describe, expect, it } from "vitest"

import {
  formatCodeSnippet,
  parseParamValues,
  serializeResponse,
} from "./invoke"

describe("parseParamValues", () => {
  it("parses numbers and rejects invalid input", () => {
    const params = parseParamValues(
      [
        {
          name: "season",
          label: "Season",
          kind: "number",
          required: true,
        },
      ],
      { season: "2025" },
    )
    expect(params.season).toBe(2025)
  })

  it("throws when a required field is missing", () => {
    expect(() =>
      parseParamValues(
        [
          {
            name: "season",
            label: "Season",
            kind: "number",
            required: true,
          },
        ],
        { season: "" },
      ),
    ).toThrow(/Season is required/)
  })
})

describe("formatCodeSnippet", () => {
  it("formats a client call", () => {
    expect(formatCodeSnippet("clubs", "list", { season: 2025 })).toBe(
      'const result = await client.clubs.list({\n    "season": 2025\n  })',
    )
  })
})

describe("serializeResponse", () => {
  it("truncates very large JSON payloads", () => {
    const big = { rows: "x".repeat(60_000) }
    const { truncated, byteLength } = serializeResponse(big)
    expect(truncated).toBe(true)
    expect(byteLength).toBeGreaterThan(48_000)
  })
})
