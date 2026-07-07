import * as z from "zod/mini"

import type { AppSearch } from "./search"
import { appSearchSchema, buildAppSearch } from "./search"
import { RESOURCE_NAMES } from "./docs/types"
import type { ResourceName } from "./docs/types"

export const docsTabSchema = z.catch(
  z.optional(z.enum(["guide", "reference", "playground"])),
  "guide",
)

const resourceSchema = z.catch(
  z.optional(z.enum(RESOURCE_NAMES)),
  undefined,
)

export const docsSearchSchema = z.extend(appSearchSchema, {
  tab: docsTabSchema,
  resource: resourceSchema,
  method: z.catch(z.optional(z.string()), undefined),
})

export type DocsSearch = z.infer<typeof docsSearchSchema>
export type DocsTab = NonNullable<DocsSearch["tab"]>

export function docsTab(search: Pick<DocsSearch, "tab">): DocsTab {
  return search.tab ?? "guide"
}

export function buildDocsSearch(input: {
  competition: AppSearch["competition"]
  season: number
  tab?: DocsTab
  resource?: ResourceName
  method?: string
}): DocsSearch {
  return docsSearchSchema.parse({
    ...buildAppSearch(input),
    tab: input.tab ?? "guide",
    resource: input.resource,
    method: input.method,
  })
}

export function isResourceName(value: string): value is ResourceName {
  return (RESOURCE_NAMES as readonly string[]).includes(value)
}
