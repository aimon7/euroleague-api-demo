import * as z from "zod/mini"

import type { AppSearch } from "./search"
import { appSearchSchema, buildAppSearch } from "./search"

export const landingTabSchema = z.catch(z.optional(z.literal("standings")), undefined)

/** Search params owned by the `/` route. */
export const landingSearchSchema = z.extend(appSearchSchema, {
  tab: landingTabSchema,
})

export type LandingSearch = z.infer<typeof landingSearchSchema>

export type LandingTab = "clubs" | "standings"

export function landingTab(search: Pick<LandingSearch, "tab">): LandingTab {
  return search.tab ?? "clubs"
}

export function buildLandingSearch(input: {
  competition: AppSearch["competition"]
  season: number
  tab?: LandingTab
}): LandingSearch {
  return landingSearchSchema.parse({
    ...buildAppSearch(input),
    tab: input.tab === "standings" ? "standings" : undefined,
  })
}
