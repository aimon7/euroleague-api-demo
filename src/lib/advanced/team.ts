import { pct  } from "../mappers"
import type {BoxTotals} from "../mappers";
import * as f from "./formulas"
import {   REFERENCES } from "./types"
import type {AdvancedStat, StatFormat} from "./types";

type ApiRow = Record<string, unknown> | undefined

/**
 * Tier-A advanced stats for a team. The EuroLeague API already returns several
 * of these in its `type: "advanced"` payload, so we prefer the API value (and
 * mark it `source: "api"`) and only compute the rest in-flight.
 */
export function teamAdvancedStats(team: BoxTotals, opp: BoxTotals, api?: ApiRow): AdvancedStat[] {
  const fromApi = (key: string): number | null => {
    const value = api?.[key]
    return value == null ? null : pct(value)
  }

  const computed = (
    key: string,
    label: string,
    value: number,
    format: StatFormat,
    formula: string,
    reference: string,
  ): AdvancedStat => ({ key, label, value, format, source: "computed", formula, reference })

  const apiOrComputed = (
    key: string,
    apiKey: string,
    label: string,
    compute: () => number,
    format: StatFormat,
    formula: string,
    reference: string,
  ): AdvancedStat => {
    const apiValue = fromApi(apiKey)
    return apiValue == null
      ? computed(key, label, compute(), format, formula, reference)
      : { key, label, value: apiValue, format, source: "api", formula, reference }
  }

  const apiOnly = (
    key: string,
    apiKey: string,
    label: string,
    format: StatFormat,
    formula: string,
    reference: string,
  ): AdvancedStat => ({
    key,
    label,
    value: fromApi(apiKey),
    format,
    source: "api",
    formula,
    reference,
  })

  return [
    computed("pace", "Pace", f.pace(team, opp), "rating", "40 × Poss / (TmMP/5)", REFERENCES.bbrRatings),
    computed("ortg", "Offensive Rating", f.offensiveRating(team, opp), "rating", "100 × PTS / Poss", REFERENCES.bbrRatings),
    computed("drtg", "Defensive Rating", f.defensiveRating(team, opp), "rating", "100 × OppPTS / Poss", REFERENCES.bbrRatings),
    computed("net", "Net Rating", f.offensiveRating(team, opp) - f.defensiveRating(team, opp), "rating", "ORtg − DRtg", REFERENCES.bbrRatings),
    apiOrComputed("efg", "effectiveFieldGoalPercentage", "Effective FG %", () => f.effectiveFieldGoalPct(team), "percent", "(FGM + 0.5 × 3PM) / FGA", REFERENCES.bbrGlossary),
    apiOrComputed("ts", "trueShootingPercentage", "True Shooting %", () => f.trueShootingPct(team), "percent", "PTS / (2 × (FGA + 0.44 × FTA))", REFERENCES.bbrGlossary),
    computed("tov", "Turnover %", f.teamTurnoverPct(team, opp), "percent", "100 × TOV / Poss", REFERENCES.bbrRatings),
    apiOrComputed("oreb", "offensiveReboundsPercentage", "Offensive Reb %", () => f.teamOffensiveReboundPct(team, opp), "percent", "OREB / (OREB + OppDREB)", REFERENCES.bbrRatings),
    apiOrComputed("ftr", "freeThrowsRate", "FT Rate", () => f.teamFreeThrowRate(team), "ratio", "FTM / FGA", REFERENCES.bbrRatings),
    apiOrComputed("astto", "assistsToTurnoversRatio", "AST/TO", () => f.assistToTurnoverRatio(team), "ratio", "AST / TOV", REFERENCES.bbrGlossary),
    apiOnly("dreb", "defensiveReboundsPercentage", "Defensive Reb %", "percent", "DREB%", REFERENCES.bbrRatings),
    apiOnly("treb", "reboundsPercentage", "Total Reb %", "percent", "TRB%", REFERENCES.bbrRatings),
    apiOnly("ar", "assistsRatio", "Assists ratio", "percent", "Assists ratio", REFERENCES.bbrGlossary),
    apiOnly("tor", "turnoversRatio", "Turnovers ratio", "percent", "Turnovers ratio", REFERENCES.bbrGlossary),
    apiOnly("2pr", "twoPointRate", "2P rate", "ratio", "2PA / FGA", REFERENCES.bbrGlossary),
    apiOnly("3pr", "threePointRate", "3P rate", "ratio", "3PA / FGA", REFERENCES.bbrGlossary),
    apiOnly("pts2", "pointsFromTwoPointersPercentage", "Pts from 2P %", "percent", "Share of points from 2P", REFERENCES.bbrGlossary),
    apiOnly("pts3", "pointsFromThreePointersPercentage", "Pts from 3P %", "percent", "Share of points from 3P", REFERENCES.bbrGlossary),
    apiOnly("ptsft", "pointsFromFreeThrowsPercentage", "Pts from FT %", "percent", "Share of points from FT", REFERENCES.bbrGlossary),
  ]
}
