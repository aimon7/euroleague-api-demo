import type { BoxTotals } from "../mappers"

// Pure Tier-A advanced-stat math. Percentage metrics return percentage points
// (e.g. 55.3 means 55.3%); rates return raw ratios. All are scale-invariant
// across accumulated vs per-game inputs except Game Score, which is per game.

/** Division that yields 0 instead of NaN/Infinity when the denominator is 0. */
export function div(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator
}

/** Estimated possessions: FGA − OREB + TOV + 0.44 × FTA. */
export function possessions(b: BoxTotals): number {
  return (
    b.fieldGoalsAttempted -
    b.offensiveRebounds +
    b.turnovers +
    0.44 * b.freeThrowsAttempted
  )
}

/** Symmetric possession estimate, averaging a team and its opponents. */
export function teamPossessions(team: BoxTotals, opp: BoxTotals): number {
  return 0.5 * (possessions(team) + possessions(opp))
}

// --- player rate metrics ----------------------------------------------------

export function effectiveFieldGoalPct(b: BoxTotals): number {
  return div(b.fieldGoalsMade + 0.5 * b.threePointersMade, b.fieldGoalsAttempted) * 100
}

export function trueShootingPct(b: BoxTotals): number {
  return div(b.points, 2 * (b.fieldGoalsAttempted + 0.44 * b.freeThrowsAttempted)) * 100
}

export function threePointAttemptRate(b: BoxTotals): number {
  return div(b.threePointersAttempted, b.fieldGoalsAttempted)
}

export function freeThrowRate(b: BoxTotals): number {
  return div(b.freeThrowsAttempted, b.fieldGoalsAttempted)
}

export function turnoverPct(b: BoxTotals): number {
  return (
    div(b.turnovers, b.fieldGoalsAttempted + 0.44 * b.freeThrowsAttempted + b.turnovers) *
    100
  )
}

export function usagePct(player: BoxTotals, team: BoxTotals): number {
  const teamPlayed = team.minutes / 5
  return (
    100 *
    div(
      (player.fieldGoalsAttempted + 0.44 * player.freeThrowsAttempted + player.turnovers) *
        teamPlayed,
      player.minutes *
        (team.fieldGoalsAttempted + 0.44 * team.freeThrowsAttempted + team.turnovers),
    )
  )
}

export function assistPct(player: BoxTotals, team: BoxTotals): number {
  const teamPlayed = team.minutes / 5
  return (
    100 *
    div(
      player.assists,
      div(player.minutes, teamPlayed) * team.fieldGoalsMade - player.fieldGoalsMade,
    )
  )
}

export function offensiveReboundPct(
  player: BoxTotals,
  team: BoxTotals,
  opp: BoxTotals,
): number {
  const teamPlayed = team.minutes / 5
  return (
    100 *
    div(
      player.offensiveRebounds * teamPlayed,
      player.minutes * (team.offensiveRebounds + opp.defensiveRebounds),
    )
  )
}

export function defensiveReboundPct(
  player: BoxTotals,
  team: BoxTotals,
  opp: BoxTotals,
): number {
  const teamPlayed = team.minutes / 5
  return (
    100 *
    div(
      player.defensiveRebounds * teamPlayed,
      player.minutes * (team.defensiveRebounds + opp.offensiveRebounds),
    )
  )
}

export function totalReboundPct(
  player: BoxTotals,
  team: BoxTotals,
  opp: BoxTotals,
): number {
  const teamPlayed = team.minutes / 5
  return (
    100 *
    div(
      player.totalRebounds * teamPlayed,
      player.minutes * (team.totalRebounds + opp.totalRebounds),
    )
  )
}

export function stealPct(player: BoxTotals, team: BoxTotals, opp: BoxTotals): number {
  const teamPlayed = team.minutes / 5
  return 100 * div(player.steals * teamPlayed, player.minutes * possessions(opp))
}

export function blockPct(player: BoxTotals, team: BoxTotals, opp: BoxTotals): number {
  const teamPlayed = team.minutes / 5
  return (
    100 *
    div(
      player.blocks * teamPlayed,
      player.minutes * (opp.fieldGoalsAttempted - opp.threePointersAttempted),
    )
  )
}

/** Hollinger Game Score, expressed per game from season totals. */
export function gameScorePerGame(b: BoxTotals): number {
  const games = b.gamesPlayed || 1
  const pg = (value: number) => value / games
  return (
    pg(b.points) +
    0.4 * pg(b.fieldGoalsMade) -
    0.7 * pg(b.fieldGoalsAttempted) -
    0.4 * (pg(b.freeThrowsAttempted) - pg(b.freeThrowsMade)) +
    0.7 * pg(b.offensiveRebounds) +
    0.3 * pg(b.defensiveRebounds) +
    pg(b.steals) +
    0.7 * pg(b.assists) +
    0.7 * pg(b.blocks) -
    0.4 * pg(b.fouls) -
    pg(b.turnovers)
  )
}

// --- team ratings -----------------------------------------------------------

export function pace(team: BoxTotals, opp: BoxTotals): number {
  return 40 * div(teamPossessions(team, opp), team.minutes / 5)
}

export function offensiveRating(team: BoxTotals, opp: BoxTotals): number {
  return 100 * div(team.points, teamPossessions(team, opp))
}

export function defensiveRating(team: BoxTotals, opp: BoxTotals): number {
  return 100 * div(opp.points, teamPossessions(team, opp))
}

export function teamTurnoverPct(team: BoxTotals, opp: BoxTotals): number {
  return 100 * div(team.turnovers, teamPossessions(team, opp))
}

export function teamOffensiveReboundPct(team: BoxTotals, opp: BoxTotals): number {
  return 100 * div(team.offensiveRebounds, team.offensiveRebounds + opp.defensiveRebounds)
}

export function teamFreeThrowRate(team: BoxTotals): number {
  return div(team.freeThrowsMade, team.fieldGoalsAttempted)
}
