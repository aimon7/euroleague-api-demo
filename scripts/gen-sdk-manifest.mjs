#!/usr/bin/env node
/**
 * Reads euroleague-api service files and writes a method manifest for drift checks.
 * Expects sibling repo at ../euroleague-api (or EUROLEAGUE_API_PATH).
 */
import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const demoRoot = path.resolve(__dirname, "..")
const sdkRoot =
  process.env.EUROLEAGUE_API_PATH ??
  path.resolve(demoRoot, "../euroleague-api")

const CLIENT_RESOURCES = [
  "boxscore",
  "clubs",
  "competitions",
  "gameMetadata",
  "games",
  "people",
  "phases",
  "playByPlay",
  "players",
  "rounds",
  "schedule",
  "seasons",
  "shots",
  "standings",
  "teams",
]

const RESOURCE_DIR = {
  boxscore: "boxscore",
  clubs: "clubs",
  competitions: "competitions",
  gameMetadata: "game-metadata",
  games: "games",
  people: "people",
  phases: "phases",
  playByPlay: "play-by-play",
  players: "players",
  rounds: "rounds",
  schedule: "schedule",
  seasons: "seasons",
  shots: "shots",
  standings: "standings",
  teams: "teams",
}

async function publicMethods(servicePath) {
  const source = await readFile(servicePath, "utf8")
  const methods = []
  const re = /^\s+async\s+(\w+)\s*\(/gm
  let match
  while ((match = re.exec(source)) !== null) {
    const name = match[1]
    if (name.startsWith("load") || name === "constructor") continue
    // Skip private methods (preceded by "private async" on same line context)
    const lineStart = source.lastIndexOf("\n", match.index) + 1
    const line = source.slice(lineStart, match.index + match[0].length)
    if (/\bprivate\s+async\b/.test(line)) continue
    methods.push(name)
  }
  return [...new Set(methods)].sort()
}

async function main() {
  const methods = []

  for (const resource of CLIENT_RESOURCES) {
    const dir = RESOURCE_DIR[resource]
    const servicePath = path.join(
      sdkRoot,
      "src/resources",
      dir,
      `${dir}.service.ts`,
    )
    const names = await publicMethods(servicePath)
    for (const method of names) {
      methods.push({ resource, method, key: `${resource}.${method}` })
    }
  }

  methods.sort((a, b) => a.key.localeCompare(b.key))

  const manifest = {
    generatedAt: new Date().toISOString(),
    sdkPath: sdkRoot,
    totalMethods: methods.length,
    methods,
  }

  const outPath = path.join(demoRoot, "scripts/sdk-method-manifest.json")
  await writeFile(outPath, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`Wrote ${methods.length} methods to ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
