import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import { buildLandingSearch } from "@/lib/landing-search"
import { useAppSearch, useLandingTabFromLocation } from "@/lib/search"
import { CompetitionSeasonControls } from "./competition-season-controls"
import { ThemeToggle } from "./theme-toggle"

const brandLogoUrl = `${import.meta.env.BASE_URL}logo-header.png`

export function AppShell({ children }: { children: ReactNode }) {
  const { competition, season } = useAppSearch()
  const landingTab = useLandingTabFromLocation()
  const homeSearch = buildLandingSearch({
    competition,
    season,
    tab: landingTab,
  })

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              search={homeSearch}
              className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight"
            >
              <img
                src={brandLogoUrl}
                alt=""
                aria-hidden
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-sm object-cover"
              />
              <span>EuroLeague API Demo</span>
            </Link>
            <nav className="hidden sm:block">
              <Link
                to="/docs"
                search={{ competition, season }}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Docs
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <CompetitionSeasonControls />
          </div>
        </div>
      </header>

      <main className="container mx-auto w-full flex-1 px-4 py-6">
        {children}
      </main>

      <footer className="container mx-auto px-4 py-8 text-xs text-muted-foreground">
        A showcase for the{" "}
        <a
          className="underline underline-offset-2"
          href="https://www.npmjs.com/package/euroleague-api"
          target="_blank"
          rel="noreferrer"
        >
          euroleague-api
        </a>{" "}
        SDK.{" "}
        <Link to="/docs" search={{ competition, season }} className="underline underline-offset-2">
          Interactive docs
        </Link>
        . Unofficial; not affiliated with EuroLeague Basketball.
      </footer>
    </div>
  )
}
