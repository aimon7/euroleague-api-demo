import * as z from "zod/mini"

import type { AppSearch } from "./search"
import { appSearchSchema, buildAppSearch } from "./search"

const clubSchema = z.catch(z.optional(z.string()), undefined)

/** Search params owned by the `/player/$personCode` route. */
export const playerSearchSchema = z.extend(appSearchSchema, {
  club: clubSchema,
})

export type PlayerSearch = z.infer<typeof playerSearchSchema>

export function buildPlayerSearch(input: {
  competition: AppSearch["competition"]
  season: number
  club?: string
}): PlayerSearch {
  return playerSearchSchema.parse({
    ...buildAppSearch(input),
    club: input.club,
  })
}
