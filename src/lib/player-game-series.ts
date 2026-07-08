export function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function withRollingAverage<TPoint>(
  points: TPoint[],
  getValue: (point: TPoint) => number | null,
  isValid: (point: TPoint) => boolean = () => true,
  windowSize = 3,
): Array<TPoint & { rollingAverage: number | null }> {
  return points.map((point, index) => {
    const window = points.slice(Math.max(0, index - windowSize + 1), index + 1)
    const validWindow = window.filter(isValid)
    if (validWindow.length === 0) {
      return { ...point, rollingAverage: null }
    }

    const values = validWindow
      .map(getValue)
      .filter((value): value is number => value != null && Number.isFinite(value))

    if (values.length === 0) {
      return { ...point, rollingAverage: null }
    }

    const average = values.reduce((total, value) => total + value, 0) / values.length
    return { ...point, rollingAverage: round1(average) }
  })
}
