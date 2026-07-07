import type { MethodDef, ParamField, PlaygroundContext } from "./types"

const SAMPLE = {
  clubCode: "OLY",
  personCode: "014316",
  gameCode: 1,
  round: 1,
  statistic: "Points",
} as const

export function defaultParamValues(
  fields: ParamField[],
  ctx: PlaygroundContext,
): Record<string, unknown> {
  const values: Record<string, unknown> = {}

  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      values[field.name] = field.defaultValue
      continue
    }

    switch (field.name) {
      case "season":
        values.season = ctx.season
        break
      case "from":
        values.from = ctx.season - 1
        break
      case "to":
        values.to = ctx.season
        break
      case "round":
        values.round = SAMPLE.round
        break
      case "gameCode":
        values.gameCode = SAMPLE.gameCode
        break
      case "clubCode":
        values.clubCode = SAMPLE.clubCode
        break
      case "personCode":
        values.personCode = SAMPLE.personCode
        break
      case "statistic":
        values.statistic = SAMPLE.statistic
        break
      case "validate":
        values.validate = false
        break
      default:
        break
    }
  }

  return values
}

export function defaultValuesForMethod(
  def: MethodDef,
  ctx: PlaygroundContext,
): Record<string, unknown> {
  return defaultParamValues(def.params, ctx)
}
