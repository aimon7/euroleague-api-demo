import type { EuroleagueClient } from "euroleague-api"

export const RESOURCE_NAMES = [
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
] as const

export type ResourceName = (typeof RESOURCE_NAMES)[number]

/** First entry in `RESOURCE_NAMES` — default when docs tabs have no `resource` in the URL. */
export const DEFAULT_DOCS_RESOURCE = RESOURCE_NAMES[0]

export function resolveDocsResource(resource?: ResourceName): ResourceName {
  if (resource && (RESOURCE_NAMES as readonly string[]).includes(resource)) {
    return resource
  }
  return DEFAULT_DOCS_RESOURCE
}

export type ParamKind = "number" | "string" | "boolean" | "enum"

export type ParamField = {
  name: string
  label: string
  kind: ParamKind
  required?: boolean
  enumValues?: readonly string[]
  defaultValue?: string | number | boolean
  description?: string
}

export type MethodDef = {
  resource: ResourceName
  method: string
  label: string
  description?: string
  params: ParamField[]
  returnType: string
  paramsOptional?: boolean
  notes?: string
  largeResponse?: boolean
  invoke: (
    client: EuroleagueClient,
    params: Record<string, unknown>,
  ) => Promise<unknown>
}

export type PlaygroundContext = {
  season: number
  competition: "euroleague" | "eurocup"
}

export function methodKey(def: Pick<MethodDef, "resource" | "method">): string {
  return `${def.resource}.${def.method}`
}

export function defineMethod(def: MethodDef): MethodDef {
  return def
}
