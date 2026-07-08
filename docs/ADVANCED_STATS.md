# Advanced Stats — Methodology (Tier A)

This document is the methodology sheet for the advanced basketball statistics surfaced in `euroleague-api-demo`. The app computes these client-side ("in flight") from box-score totals returned by the `euroleague-api` SDK. Every metric in the UI is marked as one of:

- **`From API`** — already returned by the SDK's `type: "advanced"` stats and shown verbatim.
- **`Calculated`** — computed by this app from traditional box-score totals.

> **Implementation note.** The implementation lives in `src/lib/advanced/`. Each metric is exposed as an object of the shape `{ key, label, value, source: 'api' | 'computed', formula, reference }`, so the UI can render the value, label it `From API` / `Calculated`, and link to its reference. **Minutes-unit scaling** is reconciled in `src/lib/mappers.ts` before any minutes-dependent formula runs: people endpoint rows expose player time in seconds and are converted to minutes, while team rows expose team game-clock minutes and are converted to five-player minutes for `TmMP`.

## Inputs

The formulas below draw on box-score totals exposed by the SDK:

- **Player club-stint totals** — `people.getSeasonStats({ personCode, season }).games`, grouped by each game's `playerClubCode` and summed for the games the player played with that club.
- **Team totals** — `teams.getStats({ type: "traditional", mode: "Accumulated" })`.
- **Opponent totals** — `teams.getStats({ type: "opponentsTraditional", mode: "Accumulated" })`.
- **Team advanced set** (`From API`) — `teams.getStats({ type: "advanced", mode: "Accumulated" })`, which the API returns directly: **eFG%, TS%, OREB%/DREB%/REB%, AST/TO, assistsRatio, turnoversRatio, twoPointRate, threePointRate, freeThrowsRate, and points distribution**. These are shown as `From API`.

For players who appear for multiple clubs in one season, the player advanced metrics are rendered once per club stint. The player's box-score totals in each group include only games with that `playerClubCode`. Team-context metrics such as USG%, AST%, rebound rates, STL%, and BLK% still use the matching club's accumulated season team and opponent rows; the app does not yet fetch every game boxscore to limit team/opponent context to only the games in that stint.

## Abbreviations

| Abbr. | Meaning |
| --- | --- |
| FGM / FGA | Field goals made / attempted (total) |
| 3PM / 3PA | Three-pointers made / attempted |
| FTM / FTA | Free throws made / attempted |
| PTS | Points |
| OREB / DREB / TRB | Offensive / defensive / total rebounds |
| AST | Assists |
| STL | Steals |
| BLK | Blocks |
| TOV | Turnovers |
| PF | Personal fouls |
| MP | Minutes played |
| `Tm*` | The player's **team** totals (e.g. `TmFGA`, `TmMP`) |
| `Opp*` | **Opponents'** totals (e.g. `OppDREB`, `OppPoss`) |
| Poss | Possessions (see Team metrics) |

`TmMP/5` converts team player-minutes into team **game-clock minutes** (a five-player floor), which is the standard denominator basis for the percentage metrics below. The SDK's accumulated team stat rows already report game-clock minutes, so the app converts those rows to player-minutes at the mapper boundary before formulas run.

---

## Player Metrics

All player metrics are **`Calculated`** unless explicitly stated otherwise.

| Metric | Formula | Source |
| --- | --- | --- |
| eFG% | `(FGM + 0.5*3PM) / FGA` | Calculated |
| TS% | `PTS / (2 * (FGA + 0.44*FTA))` | Calculated |
| 3PAr | `3PA / FGA` | Calculated |
| FTr | `FTA / FGA` | Calculated |
| TOV% | `TOV / (FGA + 0.44*FTA + TOV)` | Calculated |
| USG% | `100 * ((FGA + 0.44*FTA + TOV) * (TmMP/5)) / (MP * (TmFGA + 0.44*TmFTA + TmTOV))` | Calculated |
| AST% | `100 * AST / (((MP / (TmMP/5)) * TmFGM) - FGM)` | Calculated |
| OREB% | `100 * (OREB * (TmMP/5)) / (MP * (TmOREB + OppDREB))` | Calculated |
| DREB% | `100 * (DREB * (TmMP/5)) / (MP * (TmDREB + OppOREB))` | Calculated |
| TRB% | `100 * (TRB * (TmMP/5)) / (MP * (TmTRB + OppTRB))` | Calculated |
| STL% | `100 * (STL * (TmMP/5)) / (MP * OppPoss)` | Calculated |
| BLK% | `100 * (BLK * (TmMP/5)) / (MP * (OppFGA - Opp3PA))` | Calculated |
| Game Score (Hollinger) | `PTS + 0.4*FGM - 0.7*FGA - 0.4*(FTA-FTM) + 0.7*OREB + 0.3*DREB + STL + 0.7*AST + 0.7*BLK - 0.4*PF - TOV` | Calculated |
| AST/TO | `AST / TOV` | Calculated |
| STL+BLK/40 | `(STL + BLK) / MP × 40` | Calculated |

### Player metric details

- **Effective Field Goal % (eFG%)** — Field-goal accuracy adjusted so a made three-pointer is worth 1.5× a made two-pointer. Inputs: `FGM`, `3PM`, `FGA`. Reference: [Basketball-Reference glossary](https://www.basketball-reference.com/about/glossary.html).
- **True Shooting % (TS%)** — Overall shooting efficiency that folds in twos, threes, and free throws. Inputs: `PTS`, `FGA`, `FTA`. Reference: [Basketball-Reference glossary](https://www.basketball-reference.com/about/glossary.html).
- **Three-Point Attempt Rate (3PAr)** — Share of field-goal attempts taken from three. Inputs: `3PA`, `FGA`. Reference: [Basketball-Reference glossary](https://www.basketball-reference.com/about/glossary.html).
- **Free Throw Rate (FTr)** — Free-throw attempts relative to field-goal attempts. Inputs: `FTA`, `FGA`. Reference: [Basketball-Reference glossary](https://www.basketball-reference.com/about/glossary.html).
- **Turnover % (TOV%)** — Turnovers per ~100 individual play opportunities. Inputs: `TOV`, `FGA`, `FTA`. Reference: [From The Rumble Seat formula sheet](https://www.fromtherumbleseat.com/advanced-basketball-statistics-formula-sheet).
- **Usage % (USG%)** — Estimated share of team possessions a player "uses" while on the floor. Inputs: `FGA`, `FTA`, `TOV`, `MP`, `TmMP`, `TmFGA`, `TmFTA`, `TmTOV`. Reference: [Basketball-Reference glossary](https://www.basketball-reference.com/about/glossary.html).
- **Assist % (AST%)** — Estimated share of teammate field goals a player assisted while on the floor. Inputs: `AST`, `MP`, `TmMP`, `TmFGM`, `FGM`. Reference: [NU Sports Analytics — individual statistics](https://sites.northwestern.edu/nusportsanalytics/2020/12/22/an-introduction-to-advanced-basketball-statistics-individual-statistics/).
- **Offensive / Defensive / Total Rebound % (OREB% / DREB% / TRB%)** — Estimated share of available rebounds of each type grabbed while on the floor. Inputs: the relevant `OREB`/`DREB`/`TRB`, `MP`, `TmMP`, and the matching team/opponent rebound totals. Reference: [Basketball-Reference glossary](https://www.basketball-reference.com/about/glossary.html).
- **Steal % (STL%)** — Estimated share of opponent possessions ended by the player's steals. Inputs: `STL`, `MP`, `TmMP`, `OppPoss`. Reference: [NU Sports Analytics — individual statistics](https://sites.northwestern.edu/nusportsanalytics/2020/12/22/an-introduction-to-advanced-basketball-statistics-individual-statistics/).
- **Block % (BLK%)** — Estimated share of opponent two-point attempts blocked while on the floor. Inputs: `BLK`, `MP`, `TmMP`, `OppFGA`, `Opp3PA`. Reference: [Basketball-Reference glossary](https://www.basketball-reference.com/about/glossary.html).
- **Game Score (Hollinger)** — A single-number summary of a player's box-score production. Inputs: `PTS`, `FGM`, `FGA`, `FTA`, `FTM`, `OREB`, `DREB`, `STL`, `AST`, `BLK`, `PF`, `TOV`. Reference: [Basketball-Reference glossary](https://www.basketball-reference.com/about/glossary.html).

---

## Team Metrics

| Metric | Formula | Source |
| --- | --- | --- |
| Possessions (Poss) | `0.5 * ((FGA - OREB + TOV + 0.44*FTA) + (OppFGA - OppOREB + OppTOV + 0.44*OppFTA))` | Calculated |
| Pace | `40 * Poss / (TmMP/5)` | Calculated |
| Offensive Rating (ORtg) | `100 * PTS / Poss` | Calculated |
| Defensive Rating (DRtg) | `100 * OppPTS / OppPoss` | Calculated |
| Net Rating | `ORtg - DRtg` | Calculated |

### Team metric details

- **Possessions** — A symmetric estimate that averages the team's and opponents' possession counts. Inputs: `FGA`, `OREB`, `TOV`, `FTA` and their `Opp*` counterparts. Reference: [Basketball-Reference ratings](https://www.basketball-reference.com/about/ratings.html).
- **Pace** — Possessions per 40 minutes of play (EuroLeague game length). Inputs: `Poss`, `TmMP`. Reference: [Basketball-Reference ratings](https://www.basketball-reference.com/about/ratings.html).
- **Offensive Rating (ORtg)** — Points scored per 100 possessions. Inputs: `PTS`, `Poss`. Reference: [Basketball-Reference ratings](https://www.basketball-reference.com/about/ratings.html).
- **Defensive Rating (DRtg)** — Points allowed per 100 opponent possessions. Inputs: `OppPTS`, `OppPoss`. Reference: [Basketball-Reference ratings](https://www.basketball-reference.com/about/ratings.html).
- **Net Rating** — Point differential per 100 possessions. Inputs: `ORtg`, `DRtg`. Reference: [Basketball-Reference ratings](https://www.basketball-reference.com/about/ratings.html).

### Four Factors

| Factor | Formula | Source |
| --- | --- | --- |
| eFG% | `(FGM + 0.5*3PM) / FGA` | From API |
| TOV% | `TOV / Poss` | Calculated |
| OREB% | `OREB / (OREB + OppDREB)` | From API or Calculated |
| FT Rate | `FTM / FGA` | From API |

### Additional team advanced (From API)

The EuroLeague `type: "advanced"` team payload also provides these fields, shown verbatim when available:

| Metric | API field | Source |
| --- | --- | --- |
| AST/TO | `assistsToTurnoversRatio` | From API (fallback: `AST / TOV` Calculated) |
| Defensive Reb % | `defensiveReboundsPercentage` | From API |
| Total Reb % | `reboundsPercentage` | From API |
| Assists ratio | `assistsRatio` | From API |
| Turnovers ratio | `turnoversRatio` | From API |
| 2P rate | `twoPointRate` | From API |
| 3P rate | `threePointRate` | From API |
| Pts from 2P % | `pointsFromTwoPointersPercentage` | From API |
| Pts from 3P % | `pointsFromThreePointersPercentage` | From API |
| Pts from FT % | `pointsFromFreeThrowsPercentage` | From API |

### Player quick metrics (Calculated)

| Metric | Formula | Source |
| --- | --- | --- |
| AST/TO | `AST / TOV` | Calculated |
| PIR/40 | `valuation / (timePlayed / 60) × 40` | Calculated |
| Starter rate | `gamesStarted / gamesPlayed` | Calculated |
| STL+BLK/40 | `(STL + BLK) / MP × 40` | Calculated |

Plus-minus (`plusMinus`) and misc counting stats (`doubleDoubles`, `tripleDoubles`) are shown **From API** on the season summary when available.

The "Four Factors" are Dean Oliver's four core determinants of winning (shooting, turnovers, rebounding, free throws). Where the API's `type: "advanced"` team set already provides the factor (eFG%, OREB%, FT-related rate), the app shows it as `From API`; otherwise it computes it. Team `TOV%` here uses the possession-based denominator (`TOV / Poss`) rather than the player-level denominator used above. Reference: [Basketball-Reference ratings](https://www.basketball-reference.com/about/ratings.html), [From The Rumble Seat formula sheet](https://www.fromtherumbleseat.com/advanced-basketball-statistics-formula-sheet).

---

## Excluded (and why)

The following advanced metrics are **intentionally NOT implemented**:

- **RAPM** (Regularized Adjusted Plus-Minus)
- **RPM** (Real Plus-Minus)
- **RAPM-based BPM** (a "real" BPM derived from RAPM)
- **Official Win Shares**

These require full-league **play-by-play stint data** plus **ridge regression** and **EuroLeague-tuned coefficients** that are not publicly available. They cannot be computed reliably from box-score totals in a static, client-side browser app, so presenting them would mean presenting something that is neither accurate nor reproducible. For background on what these metrics involve, see [HoopsHype — advanced stats: RPM, RAPM, Win Shares](https://eu.hoopshype.com/story/sports/nba/2021/09/17/advanced-stats-nba-real-plus-minus-rapm-win-shares-analytics/75615174007/).

---

## References

- Basketball-Reference glossary — <https://www.basketball-reference.com/about/glossary.html>
- Basketball-Reference ratings (possessions, ORtg/DRtg, pace, Four Factors) — <https://www.basketball-reference.com/about/ratings.html>
- From The Rumble Seat — advanced basketball statistics formula sheet — <https://www.fromtherumbleseat.com/advanced-basketball-statistics-formula-sheet>
- Northwestern Sports Analytics — introduction to advanced basketball statistics (individual statistics) — <https://sites.northwestern.edu/nusportsanalytics/2020/12/22/an-introduction-to-advanced-basketball-statistics-individual-statistics/>
- HoopsHype — RPM / RAPM / Win Shares context (for the excluded metrics) — <https://eu.hoopshype.com/story/sports/nba/2021/09/17/advanced-stats-nba-real-plus-minus-rapm-win-shares-analytics/75615174007/>
