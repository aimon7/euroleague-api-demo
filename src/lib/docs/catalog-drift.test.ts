import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { METHOD_CATALOG } from "./catalog"
import { methodKey } from "./types"

type Manifest = {
  methods: Array<{ key: string }>
}

function loadManifest(): Set<string> {
  const manifestPath = path.resolve(
    import.meta.dirname,
    "../../../scripts/sdk-method-manifest.json",
  )
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest
  return new Set(manifest.methods.map((m) => m.key))
}

describe("docs catalog drift", () => {
  it("covers every public SDK method in the manifest", () => {
    const manifestKeys = loadManifest()
    const catalogKeys = new Set(METHOD_CATALOG.map(methodKey))

    const missing = [...manifestKeys].filter((k) => !catalogKeys.has(k))
    const extra = [...catalogKeys].filter((k) => !manifestKeys.has(k))

    expect(
      missing,
      `Catalog missing SDK methods:\n${missing.join("\n")}`,
    ).toEqual([])
    expect(
      extra,
      `Catalog has unknown methods:\n${extra.join("\n")}`,
    ).toEqual([])
  })
})
