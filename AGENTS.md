# euroleague-api-demo — Agent Guide

Agent-facing workflow and entry points for this repo. Architecture, routes, stack, and SDK surface are in [`docs/SPEC.md`](docs/SPEC.md) — reach for that **legwork** before guessing layout or behaviour.

## Finish workflow

Four phases, in order. Declare work complete only when **every** phase criterion below is met.

### 1. Slice

Implement in thin vertical **slices** — each leaves the app working and testable. Independent slices: build and verify in **tight** parallel.

**Always apply:**

- `/incremental-implementation` — slice → test → verify → commit → next slice
- `/frontend-ui-engineering` — any user-facing UI
- `/git-workflow-and-versioning` — atomic commits, trunk-friendly history

**React work — apply what matches the change:**

| Skill | Reach when |
| --- | --- |
| `/react-2026` | Stack choices, React 19 APIs, Vite + TanStack patterns |
| `/react-data-fetching` | TanStack Query hooks, caching, parallel fetches, waterfalls |
| `/react-render-optimization` | Lists, charts, filters, derived state, memoization |
| `/react-composition-2026` | Component API design, compound components, prop sprawl |
| `/vercel-react-best-practices` | Performance review (waterfalls, bundle size, re-renders) |
| `/vercel-react-view-transitions` | Route or state animations |

**Done when:** every slice is working; the skills above are applied to the changed surface.

### 2. Gate

**Browser legwork** for any `.tsx` change or routing/search-param behaviour — `/browser-testing-with-devtools`:

- Dev server: `pnpm dev` → `http://localhost:3000`
- Chrome DevTools MCP: [`.cursor/mcp.json`](.cursor/mcp.json)
- Confirm: page loads, console clean, network requests, visual correctness, accessibility tree for interactive UI

Then run automated **gates** before committing. Run independent gates in **tight** parallel (`typecheck`, `lint`, `test` together):

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e   # routes, search params, or UI navigation changed
pnpm build      # build output or deploy scripts changed
```

**Done when:** browser checks pass for the changed surface; every gate required for this change is green.

### 3. Review

1. Launch the **code-reviewer** subagent (`subagent_type: code-reviewer`) on the branch/diff
2. Apply `/code-review-and-quality` — five axes (correctness, readability, architecture, security, performance)
3. Apply `/code-simplification` on recently changed code — separate refactor commits from feature commits

**Done when:** Critical and Required findings are addressed.

### 4. React health (always last)

```sh
npx -y react-doctor@latest . --verbose
```

Fix errors first, then warnings in changed files. Re-run until the score is acceptable or remaining issues are documented.

**Done when:** react-doctor errors are fixed; changed-file warnings are fixed or documented.

---

## Project context

Browser-only showcase SPA for the [`euroleague-api`](https://www.npmjs.com/package/euroleague-api) SDK — audience is SDK evaluators. No backend, no SSR, no proxy; SDK calls EuroLeague APIs directly (CORS). Data fetching is read-only (`useQuery`). Advanced stats are computed client-side in `src/lib/advanced/` and labelled `api` vs `computed` — see [`docs/ADVANCED_STATS.md`](docs/ADVANCED_STATS.md).

- **Live:** [https://aimon7.github.io/euroleague-api-demo/](https://aimon7.github.io/euroleague-api-demo/)
- **Deploy:** push to `main` → [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) publishes `dist/client` to GitHub Pages (`base`: `/euroleague-api-demo/`)

## Entry points

Start here when navigating the codebase:

| File | Role |
| --- | --- |
| [`src/lib/euroleague.ts`](src/lib/euroleague.ts) | SDK client factory |
| [`src/lib/hooks.ts`](src/lib/hooks.ts) | Typed `useQuery` wrappers |
| [`src/lib/keys.ts`](src/lib/keys.ts) | Query-key factory |
| [`src/lib/mappers.ts`](src/lib/mappers.ts) | SDK row → view-shape mappers (`select`) |
| [`src/lib/advanced/`](src/lib/advanced/) | Computed basketball metrics (unit-tested) |
| [`src/router.tsx`](src/router.tsx) | QueryClient defaults, router setup |

## Commands

```sh
pnpm install
pnpm dev          # http://localhost:3000
pnpm typecheck
pnpm lint
pnpm test         # Vitest unit tests
pnpm build        # SPA → dist/client (+ index.html / 404.html / .nojekyll)
pnpm test:e2e     # Playwright smoke tests
```

## References

- [`README.md`](README.md) — quick human overview
- [`docs/SPEC.md`](docs/SPEC.md) — routes, project structure, SDK usage patterns
- [`docs/ADVANCED_STATS.md`](docs/ADVANCED_STATS.md) — formula definitions and metric tiers

Unofficial; not affiliated with EuroLeague Basketball.
