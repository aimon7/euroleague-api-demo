import { getRouteApi, useNavigate, useRouterState } from "@tanstack/react-router"
import * as z from "zod/mini"

import { currentSeason } from "./euroleague"

const competitionSchema = z.catch(z.enum(["euroleague", "eurocup"]), "euroleague")

const seasonSchema = z.catch(
  z.coerce.number().check(z.minimum(1991, "Season must be 1991 or later")),
  currentSeason(),
)

/** Shared search params validated on every route. */
export const appSearchSchema = z.object({
  competition: competitionSchema,
  season: seasonSchema,
})

export type AppSearch = z.infer<typeof appSearchSchema>

export function buildAppSearch(input: {
  competition: AppSearch["competition"]
  season: number
}): AppSearch {
  return appSearchSchema.parse(input)
}

const rootRoute = getRouteApi("__root__")

/** Read the shared `{ competition, season }` from any route. */
export function useAppSearch(): AppSearch {
  return rootRoute.useSearch()
}

/** Patch competition/season while preserving route-owned search params. */
export function useUpdateAppSearch() {
  const navigate = useNavigate()
  return (next: Partial<AppSearch>) =>
    navigate({
      to: ".",
      search: (prev) => ({ ...prev, ...next }),
    })
}

/** Landing `tab` is only meaningful on `/`; read it from the current location. */
export function useLandingTabFromLocation(): "standings" | undefined {
  return useRouterState({
    select: (state) =>
      state.location.pathname === "/" && state.location.search.tab === "standings"
        ? "standings"
        : undefined,
  })
}
