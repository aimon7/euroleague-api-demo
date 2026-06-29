export type StatSource = "api" | "computed"
export type StatFormat = "percent" | "ratio" | "rating" | "number"

/**
 * One advanced metric, carrying enough metadata for the UI to (a) format it and
 * (b) show whether it came straight From the API or was Calculated in-flight,
 * with the formula and a reference for the methodology tooltip.
 */
export interface AdvancedStat {
  key: string
  label: string
  value: number | null
  format: StatFormat
  source: StatSource
  formula: string
  reference: string
}

export const REFERENCES = {
  bbrGlossary: "https://www.basketball-reference.com/about/glossary.html",
  bbrRatings: "https://www.basketball-reference.com/about/ratings.html",
  rumbleSeat:
    "https://www.fromtherumbleseat.com/advanced-basketball-statistics-formula-sheet",
  northwestern:
    "https://sites.northwestern.edu/nusportsanalytics/2020/12/22/an-introduction-to-advanced-basketball-statistics-individual-statistics/",
} as const

export function formatStat(stat: AdvancedStat): string {
  if (stat.value == null || !Number.isFinite(stat.value)) return "—"
  switch (stat.format) {
    case "percent":
      return `${stat.value.toFixed(1)}%`
    case "ratio":
      return stat.value.toFixed(3)
    case "rating":
      return stat.value.toFixed(1)
    default:
      return stat.value.toFixed(1)
  }
}
