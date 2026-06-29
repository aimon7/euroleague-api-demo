import * as z from "zod/mini"

import type { AppSearch } from "./search"
import { appSearchSchema, buildAppSearch } from "./search"

export const teamPanelSchema = z.catch(z.optional(z.literal("stats")), undefined)

/** Search params owned by the `/team/$clubCode` route. */
export const teamSearchSchema = z.extend(appSearchSchema, {
  panel: teamPanelSchema,
})

export type TeamSearch = z.infer<typeof teamSearchSchema>

export type TeamPanel = "roster" | "stats"

export function teamPanel(search: Pick<TeamSearch, "panel">): TeamPanel {
  return search.panel ?? "roster"
}

export function buildTeamSearch(input: {
  competition: AppSearch["competition"]
  season: number
  panel?: TeamPanel
}): TeamSearch {
  return teamSearchSchema.parse({
    ...buildAppSearch(input),
    panel: input.panel === "stats" ? "stats" : undefined,
  })
}
