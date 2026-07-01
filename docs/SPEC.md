# euroleague-api-demo — Specification

## Objective

`euroleague-api-demo` is a polished, fully client-side showcase application for the npm package **`euroleague-api@^1.0.0`**, a strongly-typed TypeScript SDK for the public EuroLeague/EuroCup APIs. The app is embedded as the working example in the SDK's README, so its primary audience is **SDK evaluators and prospective users** reading that README and deciding whether to adopt the package. Success means a fast, visually polished, end-to-end-typed single-page app that (a) exercises the breadth of the SDK surface (clubs, people, seasons, players/teams stats, standings, schedule, etc.), (b) demonstrates idiomatic data-fetching patterns with TanStack Query `select` mappers, and (c) shows how to compute basketball advanced statistics **client-side ("in flight")** from the box-score totals the SDK returns — clearly distinguishing API-provided stats from app-computed ones. The app is a pure SPA with no server runtime, deployed to GitHub Pages at <https://aimon7.github.io/euroleague-api-demo/>. Because every EuroLeague host returns `Access-Control-Allow-Origin: *`, the SDK runs directly in the browser with no proxy, and the API is read-only (everything is a `useQuery`).

## Tech Stack

| Concern | Choice |
| --- | --- |
| Framework | TanStack Start (**SPA mode**, no server runtime) |
| Routing | TanStack Router (file-based routing) |
| UI library | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (**Base UI** variant, `@base-ui/react`) |
| Data fetching | TanStack Query (`@tanstack/react-query`), wired via `@tanstack/react-router-ssr-query` |
| Tables | TanStack Table (`@tanstack/react-table`) |
| Charts | Recharts (via the shadcn `chart` component) |
| SDK | `euroleague-api@^1.0.0` |
| Package manager | pnpm |
| Runtime | Node >= 20 |

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the dev server on **port 3000** |
| `pnpm build` | Vite build → `dist/client`; a `postbuild` step copies the SPA shell `_shell.html` to `index.html` + `404.html` and writes `.nojekyll` |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright headless smoke tests |

Deployment: GitHub Actions builds and publishes `dist/client` to GitHub Pages. In production the Vite `base` is `/euroleague-api-demo/`.

## Routes

There are three routes. `competition` (`euroleague` | `eurocup`) and `season` (start-year number, e.g. `2025`) are always carried in the URL search params (defaults: `euroleague`, latest season `2025`).

- **`/` (landing)** — a competition selector and a season selector, plus a tabbed view:
  - **Tab 1 — Clubs**: a grid of club cards.
  - **Tab 2 — Standings**: a sortable standings table.
  - Clicking a club card or a standings row navigates to the team route.
- **`/team/$clubCode`** — a club header (crest, country, city, venue, president, website) and tabs:
  - **Roster**: players + staff, split by `typeName`.
  - **Stats**: team stats including advanced — both API-provided and computed. Season selector lives in the URL.
- **`/player/$personCode`** — a player profile (bio, photo), season & career stat cards, a per-game/season trend chart, and computed advanced-stat cards. Season selector lives in the URL.

## Project Structure

```
src/
  routes/                file-based routes (TanStack Router) — /, /team/$clubCode, /player/$personCode
  lib/
    euroleague.ts        SDK client factory (new EuroleagueClient({ competition }))
    euroleague-keys.ts   query-key factory for TanStack Query
    mappers.ts           SDK row/entity → view-shape mappers (used in select)
    hooks/               typed useQuery wrappers per resource
    advanced/            advanced-stat formulas (pure functions)
    ...                  misc helpers (formatting, minutes-unit reconciliation, etc.)
  components/
    ui/                  shadcn/ui (Base UI) components
    <feature>/           feature components (clubs grid, standings table, roster, charts, stat cards, ...)
docs/                    SPEC.md, ADVANCED_STATS.md
e2e/                     Playwright headless smoke tests
scripts/                 build helpers (e.g. postbuild SPA-shell copy + .nojekyll)
.github/workflows/       GitHub Actions deploy to GitHub Pages
```

## SDK Surface

A client is created per competition: `new EuroleagueClient({ competition })`. Resources:

- `clubs` — `list` / `get` / `getRoster` / `getLogo`
- `people` — `getProfile` / `getCareer` / `getSeasonRegistration` / `getCareerStats` / `getSeasonStats` / `getRecords`
- `seasons` — `list` / `get`
- `phases` — `list` / `get`
- `rounds` — `list` / `get`
- `competitions` — `list` / `get`
- `players` — `getStats` / `getStatsRange` / `getStatsAllSeasons` / `getLeaders` / `getLeadersRange` / `getLeadersAllSeasons`
- `teams` — same shape as `players`
- `standings` — `getRound`
- `schedule` — `getSeason` / `getRound` / `getSeasons`
- `shots`, `boxscore`, `playByPlay`, `gameMetadata`

`season` is the start-year number (e.g. `2025`). Entities (`Club`, `Registration`/roster member, `Season`, `PersonProfile`, `PersonStats`) are strongly-typed objects. Stats rows (`PlayerStat` / `TeamStat` / `Standing`) are `Record<string, string | number | boolean | null>`, where nested `player` / `team` / `club` objects are JSON-stringified by the SDK's shallow normalizer; the app unpacks them in TanStack Query `select` mappers.

## Code Style

- **TypeScript strict** throughout. Function components only; no class components.
- Data is fetched via TanStack Query hooks whose **`select` mappers own the view shape** — components receive already-shaped, typed data and stay declarative.
- Use **Base UI shadcn components only**; do not hand-roll UI primitives.
- Prefer **deriving values during render** over storing derived state.
- Keep query keys in the `euroleague-keys.ts` factory and SDK access behind `lib/hooks/`.

A representative typed `useQuery` hook with a `select` mapper, consistent with the SDK:

```tsx
import { useQuery } from '@tanstack/react-query'
import { keys } from '@/lib/euroleague-keys'
import { getClient } from '@/lib/euroleague'
import { toPlayerStatRow, type PlayerStatRow } from '@/lib/mappers'
import type { Competition } from 'euroleague-api'

export function usePlayerStats(
  competition: Competition,
  season: number,
): { rows: PlayerStatRow[]; isLoading: boolean } {
  const client = getClient(competition)
  const params = { season, type: 'traditional', mode: 'Accumulated' } as const

  const { data, isLoading } = useQuery({
    queryKey: keys.players.stats(competition, params),
    queryFn: () => client.players.getStats(params),
    select: (rows): PlayerStatRow[] => rows.map(toPlayerStatRow),
  })

  return { rows: data ?? [], isLoading }
}
```

## Testing Strategy

- **Unit (Vitest)**: pure functions in `src/lib/advanced` are tested with **known-value fixtures** so every formula has a verified expected output.
- **E2E (Playwright, headless smoke)**: one smoke test per route that asserts a **clean browser console** (no errors/warnings) and captures **screenshot evidence**.
- **Gates**: `pnpm typecheck` and `pnpm lint` must pass; these run alongside tests before commit.

## Boundaries

**Always**
- Run `pnpm typecheck` + `pnpm lint` + `pnpm test:e2e` before commit.
- Keep commits small and focused.
- Use shadcn (Base UI) components for UI.
- Keep `competition` and `season` in the URL search params.

**Ask first**
- Adding dependencies.
- Changing the route structure.
- Changing the deploy target.

**Never**
- Commit secrets.
- Hand-fetch endpoints the SDK already wraps.
- Present a computed stat without marking it as computed.
- Claim a stat is official when it is an approximation.

## Success Criteria

- All **three routes** (`/`, `/team/$clubCode`, `/player/$personCode`) render with **live data** and a **clean console** (no errors).
- Computed advanced stats are **visibly marked** in the UI as `Calculated` vs `From API`-sourced.
- `pnpm build` succeeds and `dist/client` contains `index.html`, `404.html`, and `.nojekyll`, with assets prefixed by `/euroleague-api-demo/`.
- The **deployed** GitHub Pages site loads, and **deep links work on refresh** (SPA fallback via the copied `404.html`).

## Open Questions

- **Minutes-unit convention**: player stat rows expose player minutes; accumulated team stat rows expose team game-clock minutes. `src/lib/mappers.ts` converts team stat rows to five-player minutes before advanced formulas consume `TmMP`.
- Confirm which fields the API's `type: "advanced"` team set exposes verbatim vs which must be computed, so the UI's `From API` / `Calculated` markers stay accurate.
- Confirm the canonical latest-season default if/when a new season opens (currently `2025`).
