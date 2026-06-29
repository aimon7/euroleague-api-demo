import { EuroleagueClient  } from "euroleague-api"
import type {Competition} from "euroleague-api";

// One stateless client per competition, created lazily and reused so Euroleague
// and EuroCup never share a cache identity.
const clients = new Map<Competition, EuroleagueClient>()

// The SDK calls fetch with two browser-hostile defaults that we correct here:
//  1. It stores a bare `globalThis.fetch` reference and calls it unbound, which
//     throws "Illegal invocation" in browsers — so we forward through a wrapper.
//  2. It forces `Accept: application/json`. The upstream Cloudflare cache varies
//     CORS headers on `Accept` but not `Origin`, and the `application/json`
//     variant is frequently cached WITHOUT `Access-Control-Allow-Origin`
//     (poisoned by server-side callers). Dropping the header lets the browser
//     send its default `Accept: */*`, which hits the CORS-healthy cache variant.
function browserFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  headers.delete("accept")
  return globalThis.fetch(input, { ...init, headers })
}

export function getClient(competition: Competition): EuroleagueClient {
  let client = clients.get(competition)
  if (!client) {
    client = new EuroleagueClient({
      competition,
      retries: 2,
      fetch: browserFetch,
    })
    clients.set(competition, client)
  }
  return client
}

export const COMPETITIONS = ["euroleague", "eurocup"] as const

export const COMPETITION_LABELS: Record<Competition, string> = {
  euroleague: "EuroLeague",
  eurocup: "EuroCup",
}

export function isCompetition(value: unknown): value is Competition {
  return value === "euroleague" || value === "eurocup"
}

// First season the public stats endpoints reliably cover.
export const FIRST_SEASON = 2000

// EuroLeague seasons start in autumn; the start year is the season's identity
// (e.g. 2025 == the 2025-26 season). Used only as the URL default before the
// real season list loads; the <Select> options come from `seasons.list()`.
export function currentSeason(date = new Date()): number {
  const year = date.getFullYear()
  return date.getMonth() >= 8 ? year : year - 1
}

export function seasonLabel(season: number): string {
  const next = (season + 1) % 100
  return `${season}-${String(next).padStart(2, "0")}`
}
