import {
  COMPETITIONS,
  COMPETITION_LABELS,
  isCompetition,
  seasonLabel,
} from "@/lib/euroleague"
import { useSeasons } from "@/lib/hooks"
import { useAppSearch, useUpdateAppSearch } from "@/lib/search"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CompetitionSeasonControls() {
  const { competition, season } = useAppSearch()
  const update = useUpdateAppSearch()
  const seasons = useSeasons(competition)

  // Until the season list loads, keep the current season selectable so the
  // control is never empty.
  const seasonOptions = seasons.data ?? [{ year: season, label: seasonLabel(season) }]

  return (
    <div className="flex items-center gap-2">
      <Select
        value={competition}
        onValueChange={(value) => {
          if (isCompetition(value)) update({ competition: value })
        }}
      >
        <SelectTrigger aria-label="Competition" className="min-w-30">
          <SelectValue>
            {(value) =>
              isCompetition(value) ? COMPETITION_LABELS[value] : String(value)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {COMPETITIONS.map((code) => (
            <SelectItem key={code} value={code}>
              {COMPETITION_LABELS[code]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(season)}
        onValueChange={(value) => update({ season: Number(value) })}
      >
        <SelectTrigger aria-label="Season" className="min-w-24">
          <SelectValue>{(value) => seasonLabel(Number(value))}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {seasonOptions.map((option) => (
            <SelectItem key={option.year} value={String(option.year)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
