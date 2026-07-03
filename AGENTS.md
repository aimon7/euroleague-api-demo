# euroleague-api-demo — Agent Guide

Agent-facing reference for what this project is, how it is organized, and how to finish work correctly.

## Project summary

`euroleague-api-demo` is a polished, fully client-side showcase SPA for the [`euroleague-api`](https://www.npmjs.com/package/euroleague-api) npm SDK — a strongly-typed TypeScript client for the public EuroLeague and EuroCup APIs. The primary audience is **SDK evaluators** reading the package README and deciding whether to adopt it.

- **Live:** https://aimon7.github.io/euroleague-api-demo/
- **Architecture:** 100% browser-side — no backend or server runtime. The SDK calls EuroLeague APIs directly (CORS `Access-Control-Allow-Origin: *`). All data fetching is read-only (`useQuery`).
- **Advanced stats:** Box-score-derived metrics are computed in-flight in `src/lib/advanced/` and marked as `api` vs `computed`. See [`docs/ADVANCED_STATS.md`](docs/ADVANCED_STATS.md).
- **Routes:** `/` (landing), `/team/$clubCode`, `/player/$personCode`. `competition` (`euroleague` | `eurocup`) and `season` (start-year, e.g. `2025`) are always in URL search params.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | TanStack Start (SPA mode, no server runtime) |
| Routing | TanStack Router (file-based, `src/routes/`) |
| Data | TanStack Query + `@tanstack/react-router-ssr-query` |
| Tables | TanStack Table (`@tanstack/react-table`) |
| UI | React 19, Tailwind CSS v4, shadcn/ui (Base UI), Recharts |
| Build | Vite 8, pnpm |
| SDK | `euroleague-api` |
| Tests | Vitest (unit), Playwright (e2e) |
| Runtime | Node >= 20 |

**Not in scope:** SSR, server runtime, backend proxy. `/react-selective-hydration` applies only if SSR/streaming is introduced later — not applicable to the current SPA.

## Repository layout

```
src/
  routes/              # file-based routes — /, /team/$clubCode, /player/$personCode
  lib/
    euroleague.ts      # SDK client factory (new EuroleagueClient({ competition }))
    keys.ts            # query-key factory for TanStack Query
    hooks.ts           # typed useQuery wrappers per resource
    mappers.ts         # SDK row/entity → view-shape mappers (used in select)
    advanced/          # advanced-stat formulas (pure functions, unit-tested)
  components/
    ui/                # shadcn/ui (Base UI) primitives
    <feature>/         # landing, team, player, app shell, stats, charts
docs/                  # SPEC.md, ADVANCED_STATS.md
e2e/                   # Playwright smoke tests
scripts/               # build helpers (postbuild SPA-shell copy + .nojekyll)
.github/workflows/     # GitHub Actions deploy to GitHub Pages
```

High-signal files:

- [`src/lib/euroleague.ts`](src/lib/euroleague.ts) — SDK client factory
- [`src/lib/hooks.ts`](src/lib/hooks.ts) — typed `useQuery` wrappers
- [`src/lib/advanced/`](src/lib/advanced/) — computed basketball metrics (unit-tested)
- [`src/router.tsx`](src/router.tsx) — QueryClient defaults, router setup

## Commands and verification gates

```sh
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck
pnpm lint
pnpm test         # Vitest unit tests
pnpm build        # SPA build → dist/client (+ index.html / 404.html / .nojekyll)
pnpm test:e2e     # Playwright smoke tests — run when UI/routing behavior changed
```

Run independent checks **in parallel** when possible (e.g. `typecheck`, `lint`, and `test` together).

Deployment: pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), publishing `dist/client` to GitHub Pages. Production Vite `base` is `/euroleague-api-demo/`.

---

## When a task or plan is finished

Follow these four phases in order before declaring work complete.

### 1. Build

Implement in **thin vertical slices** — each slice leaves the app working and testable. Where slices are independent (e.g. separate components or test files), build and verify them **in parallel**.

**Always apply these skills:**

- `/incremental-implementation` — slice → test → verify → commit → next slice
- `/frontend-ui-engineering` — for any user-facing UI work
- `/git-workflow-and-versioning` — atomic commits, descriptive messages, trunk-friendly history

**For React work, apply what is relevant each time (not all blindly):**

| Skill | When to use in this repo |
| --- | --- |
| `/react-2026` | Stack choices, React 19 APIs, Vite + TanStack patterns |
| `/react-data-fetching` | TanStack Query hooks, caching, parallel fetches, avoiding waterfalls |
| `/react-render-optimization` | Lists, charts, filters, derived state, memoization |
| `/react-composition-2026` | Component API design, compound components, prop sprawl |
| `/vercel-react-best-practices` | Performance review (waterfalls, bundle size, re-renders) |
| `/vercel-react-view-transitions` | Route/state animations (if adding transitions) |
| `/react-selective-hydration` | **Only if** SSR/streaming is added — not applicable to current SPA |

### 2. Verify

Use `/browser-testing-with-devtools` for any browser-facing change:

- Dev server: `pnpm dev` → `http://localhost:3000`
- Chrome DevTools MCP is configured in [`.cursor/mcp.json`](.cursor/mcp.json)
- Check: page loads, console clean, network requests, visual correctness, accessibility tree for interactive UI
- For `.tsx` changes: confirm behavior in the internal browser

Automated gates (`typecheck`, `lint`, `test`, `build`, `test:e2e` as applicable) still run in addition to browser verification.

### 3. Review

Before marking work done:

1. Launch the **code-reviewer** subagent (`subagent_type: code-reviewer`) on the branch/diff
2. Apply `/code-review-and-quality` — five-axis review (correctness, readability, architecture, security, performance)
3. Apply `/code-simplification` on recently changed code — simplify without changing behavior; separate refactor commits from feature commits

Address Critical and Required findings before declaring complete.

### 4. React health check (always last)

Run react-doctor on the project root:

```sh
npx -y react-doctor@latest . --verbose
```

Fix errors first, then warnings that relate to changed files. Re-run until the score is acceptable or remaining issues are documented.

---

## Key references

- [`README.md`](README.md) — quick human overview
- [`docs/SPEC.md`](docs/SPEC.md) — full project spec (routes, SDK surface, architecture)
- [`docs/ADVANCED_STATS.md`](docs/ADVANCED_STATS.md) — formula definitions and metric tiers

Unofficial; not affiliated with EuroLeague Basketball.
