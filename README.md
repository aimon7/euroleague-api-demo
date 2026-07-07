# euroleague-api-demo

A live, fully-typed showcase for the [`euroleague-api`](https://www.npmjs.com/package/euroleague-api) SDK — a strongly-typed TypeScript client for the EuroLeague and EuroCup public APIs.

**Live:** https://aimon7.github.io/euroleague-api-demo/

It is a 100% client-side single-page app (no backend): the SDK calls the EuroLeague API directly from the browser, and a few advanced basketball metrics are computed in-flight and clearly marked as `Calculated` vs `From API`.

## What it demonstrates

- **Landing** — pick a competition (EuroLeague / EuroCup) and season (kept in the URL), browse the **clubs** grid, and sort the **standings** table. Click any club to open its page.
- **`/team/$clubCode`** — club info, full **roster** (players + staff), and team **stats** including advanced metrics (the API's own advanced values plus ones computed here).
- **`/player/$personCode`** — player profile, season stat cards, a per-game **trend chart**, and computed advanced stats with their formulas.
- **`/docs`** — install guide, method reference, and a live **playground** for every SDK resource.

## Stack

TanStack Start (SPA mode) · TanStack Router · TanStack Query · TanStack Table · React 19 · Vite · Tailwind CSS v4 · shadcn/ui (Base UI) · Recharts · `euroleague-api`.

## Advanced stats

Tier-A, box-score-derived metrics (TS%, eFG%, USG%, AST%, TOV%, rebound/steal/block %, Game Score; team Pace, ORtg/DRtg, Net Rating, Four Factors) are computed in `src/lib/advanced/` and unit-tested. Each metric carries its formula, a reference, and a `source` flag (`api` | `computed`). See [`docs/ADVANCED_STATS.md`](./docs/ADVANCED_STATS.md). Regression-style all-in-one metrics (RAPM/RPM/true BPM/Win Shares) are intentionally out of scope — they require full play-by-play data and league-tuned coefficients that aren't feasible in a static browser app.

## Develop

```sh
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck
pnpm lint
pnpm test         # vitest unit tests (advanced-stats formulas)
pnpm test:e2e     # Playwright headless smoke (clean console + screenshots)
pnpm build        # SPA build -> dist/client (+ index.html / 404.html / .nojekyll)
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the SPA and publishes `dist/client` to GitHub Pages. The Vite `base` is `/euroleague-api-demo/` in production, and the build copies the SPA shell to `index.html` + `404.html` so client-side deep links survive a hard refresh.

See [`docs/SPEC.md`](./docs/SPEC.md) for the full project spec.

---

Unofficial; not affiliated with EuroLeague Basketball.
