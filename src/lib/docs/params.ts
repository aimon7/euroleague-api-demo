import type { ParamField } from "./types"

export function seasonField(required = true): ParamField {
  return {
    name: "season",
    label: "Season",
    kind: "number",
    required,
  }
}

export function roundField(): ParamField {
  return { name: "round", label: "Round", kind: "number", required: true }
}

export function gameCodeField(): ParamField {
  return { name: "gameCode", label: "Game code", kind: "number", required: true }
}

export function clubCodeField(): ParamField {
  return { name: "clubCode", label: "Club code", kind: "string", required: true }
}

export function personCodeField(): ParamField {
  return { name: "personCode", label: "Person code", kind: "string", required: true }
}

export function fromToFields(): ParamField[] {
  return [
    { name: "from", label: "From season", kind: "number", required: true },
    { name: "to", label: "To season", kind: "number", required: true },
  ]
}

export function validateField(defaultValue = false): ParamField {
  return {
    name: "validate",
    label: "Validate response",
    kind: "boolean",
    defaultValue,
    description: "Skip per-row Zod validation on large feeds for faster responses.",
  }
}

export const playerStatsTypeField: ParamField = {
  name: "type",
  label: "Stats type",
  kind: "enum",
  enumValues: ["traditional", "advanced", "misc", "scoring"],
  defaultValue: "traditional",
}

export const playerStatsModeField: ParamField = {
  name: "mode",
  label: "Mode",
  kind: "enum",
  enumValues: ["PerGame", "Accumulated"],
  defaultValue: "PerGame",
}

export const phaseField: ParamField = {
  name: "phase",
  label: "Phase",
  kind: "enum",
  enumValues: ["RS", "PO", "FF"],
}

export const seasonModeField: ParamField = {
  name: "seasonMode",
  label: "Season mode",
  kind: "enum",
  enumValues: ["Single", "All"],
  defaultValue: "Single",
  description: "Single scopes to the requested season; All returns career/all-time aggregates.",
}

export const limitField: ParamField = {
  name: "limit",
  label: "Limit",
  kind: "number",
  defaultValue: 400,
}

export const statisticField: ParamField = {
  name: "statistic",
  label: "Statistic",
  kind: "string",
  required: true,
  defaultValue: "Points",
}

export const standingsTypeField: ParamField = {
  name: "type",
  label: "Standings type",
  kind: "enum",
  enumValues: [
    "basicstandings",
    "calendarstandings",
    "streaks",
    "aheadbehind",
    "margins",
  ],
  defaultValue: "basicstandings",
}

export const quarterScoreTypeField: ParamField = {
  name: "type",
  label: "Quarter score type",
  kind: "enum",
  enumValues: ["ByQuarter", "EndOfQuarter"],
}

export const playerStatsParams: ParamField[] = [
  seasonField(),
  playerStatsTypeField,
  playerStatsModeField,
  phaseField,
  seasonModeField,
  limitField,
]

export const playerStatsRangeParams: ParamField[] = [
  ...fromToFields(),
  playerStatsTypeField,
  playerStatsModeField,
  phaseField,
  limitField,
]

export const playerLeadersParams: ParamField[] = [...playerStatsParams, statisticField]

export const playerLeadersRangeParams: ParamField[] = [
  ...playerStatsRangeParams,
  statisticField,
]

export const gameRefParams: ParamField[] = [seasonField(), gameCodeField()]

export const gameRoundParams: ParamField[] = [seasonField(), roundField()]

export const gameSeasonParams: ParamField[] = [seasonField()]

export const gameSeasonsParams: ParamField[] = fromToFields()

export const shotGameParams: ParamField[] = [...gameRefParams, validateField(false)]

export const shotRoundParams: ParamField[] = [
  ...gameRoundParams,
  validateField(false),
]

export const shotSeasonParams: ParamField[] = [
  ...gameSeasonParams,
  validateField(false),
]

export const shotSeasonsParams: ParamField[] = [
  ...gameSeasonsParams,
  validateField(false),
]
