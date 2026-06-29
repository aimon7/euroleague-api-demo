import type { BoxTotals } from "../mappers"
import * as f from "./formulas"
import {  REFERENCES } from "./types"
import type {AdvancedStat} from "./types";

/**
 * Tier-A advanced stats for a player, computed in-flight from the player's
 * season totals plus their team's and opponents' totals. The EuroLeague API
 * does not return these for players, so every entry is `source: "computed"`.
 */
export function playerAdvancedStats(
  player: BoxTotals,
  team: BoxTotals,
  opp: BoxTotals,
): AdvancedStat[] {
  const c = (
    key: string,
    label: string,
    value: number,
    format: AdvancedStat["format"],
    formula: string,
    reference: string,
  ): AdvancedStat => ({ key, label, value, format, source: "computed", formula, reference })

  return [
    c("ts", "True Shooting %", f.trueShootingPct(player), "percent", "PTS / (2 × (FGA + 0.44 × FTA))", REFERENCES.bbrGlossary),
    c("efg", "Effective FG %", f.effectiveFieldGoalPct(player), "percent", "(FGM + 0.5 × 3PM) / FGA", REFERENCES.bbrGlossary),
    c("usg", "Usage %", f.usagePct(player, team), "percent", "100 × ((FGA + 0.44×FTA + TOV) × (TmMP/5)) / (MP × (TmFGA + 0.44×TmFTA + TmTOV))", REFERENCES.bbrGlossary),
    c("ast", "Assist %", f.assistPct(player, team), "percent", "100 × AST / (((MP / (TmMP/5)) × TmFGM) − FGM)", REFERENCES.bbrGlossary),
    c("tov", "Turnover %", f.turnoverPct(player), "percent", "TOV / (FGA + 0.44×FTA + TOV)", REFERENCES.bbrGlossary),
    c("oreb", "Offensive Reb %", f.offensiveReboundPct(player, team, opp), "percent", "100 × (OREB × (TmMP/5)) / (MP × (TmOREB + OppDREB))", REFERENCES.bbrGlossary),
    c("dreb", "Defensive Reb %", f.defensiveReboundPct(player, team, opp), "percent", "100 × (DREB × (TmMP/5)) / (MP × (TmDREB + OppOREB))", REFERENCES.bbrGlossary),
    c("trb", "Total Reb %", f.totalReboundPct(player, team, opp), "percent", "100 × (TRB × (TmMP/5)) / (MP × (TmTRB + OppTRB))", REFERENCES.bbrGlossary),
    c("stl", "Steal %", f.stealPct(player, team, opp), "percent", "100 × (STL × (TmMP/5)) / (MP × OppPoss)", REFERENCES.northwestern),
    c("blk", "Block %", f.blockPct(player, team, opp), "percent", "100 × (BLK × (TmMP/5)) / (MP × (OppFGA − Opp3PA))", REFERENCES.northwestern),
    c("3par", "3PA Rate", f.threePointAttemptRate(player), "ratio", "3PA / FGA", REFERENCES.bbrGlossary),
    c("ftr", "FT Rate", f.freeThrowRate(player), "ratio", "FTA / FGA", REFERENCES.bbrGlossary),
    c("gmsc", "Game Score", f.gameScorePerGame(player), "number", "Hollinger Game Score, per game", REFERENCES.rumbleSeat),
  ]
}
