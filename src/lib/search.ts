import { getRouteApi, useNavigate } from "@tanstack/react-router"
import type { Competition } from "euroleague-api"

import { currentSeason, isCompetition } from "./euroleague"

// Competition + season are shared across every route and live in the URL search
// params, so links are shareable and a refresh restores the exact view.
export interface AppSearch {
  competition: Competition
  season: number
}

export function validateAppSearch(search: Record<string, unknown>): AppSearch {
  const competition = isCompetition(search.competition) ? search.competition : "euroleague"
  const season = Number(search.season)
  return {
    competition,
    season: Number.isFinite(season) && season > 1990 ? season : currentSeason(),
  }
}

const rootRoute = getRouteApi("__root__")

/** Read the validated `{ competition, season }` from any route. */
export function useAppSearch(): AppSearch {
  return rootRoute.useSearch()
}

/** Patch the shared search params while staying on the current route. */
export function useUpdateAppSearch() {
  const navigate = useNavigate()
  return (next: Partial<AppSearch>) =>
    navigate({ to: ".", search: (prev) => ({ ...prev, ...next }) })
}
