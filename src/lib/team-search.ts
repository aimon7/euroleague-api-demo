import * as z from "zod/mini"

import type { AppSearch } from "./search"
import { appSearchSchema, buildAppSearch } from "./search"

export const teamPanelSchema = z.catch(z.optional(z.literal("stats")), undefined)

export const rosterSortSchema = z.catch(
  z.optional(z.union([z.literal("name"), z.literal("jersey")])),
  undefined,
)

/** Search params owned by the `/team/$clubCode` route. */
export const teamSearchSchema = z.extend(appSearchSchema, {
  panel: teamPanelSchema,
  rosterSort: rosterSortSchema,
})

export type TeamSearch = z.infer<typeof teamSearchSchema>

export type TeamPanel = "roster" | "stats"

export type RosterSort = "position" | "name" | "jersey"

export function teamPanel(search: Pick<TeamSearch, "panel">): TeamPanel {
  return search.panel ?? "roster"
}

export function rosterSort(search: Pick<TeamSearch, "rosterSort">): RosterSort {
  return search.rosterSort ?? "position"
}

export function buildTeamSearch(input: {
  competition: AppSearch["competition"]
  season: number
  panel?: TeamPanel
  rosterSort?: RosterSort
}): TeamSearch {
  return teamSearchSchema.parse({
    ...buildAppSearch(input),
    panel: input.panel === "stats" ? "stats" : undefined,
    rosterSort:
      input.rosterSort && input.rosterSort !== "position" ? input.rosterSort : undefined,
  })
}
