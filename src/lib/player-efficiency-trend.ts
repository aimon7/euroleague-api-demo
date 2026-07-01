export interface PlayerEfficiencyPoint {
  points: number
  rawShootingPossessions: number
  rollingTrueShootingPct: number | null
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function trueShootingPctFromInputs(
  points: number,
  fieldGoalAttempts: number,
  freeThrowAttempts: number,
) {
  const shootingPossessions = fieldGoalAttempts + 0.44 * freeThrowAttempts
  if (shootingPossessions === 0) return null
  return round1((points / (2 * shootingPossessions)) * 100)
}

export function withRollingTrueShooting<TPoint extends PlayerEfficiencyPoint>(
  games: TPoint[],
): TPoint[] {
  return games.map((game, index) => {
    const window = games.slice(Math.max(0, index - 2), index + 1)
    const validWindow = window.filter((point) => point.rawShootingPossessions > 0)
    if (validWindow.length === 0) return game

    const totalPoints = validWindow.reduce((total, point) => total + point.points, 0)
    const totalShootingPossessions = validWindow.reduce(
      (total, point) => total + point.rawShootingPossessions,
      0,
    )

    return {
      ...game,
      rollingTrueShootingPct: round1(
        (totalPoints / (2 * totalShootingPossessions)) * 100,
      ),
    }
  })
}
