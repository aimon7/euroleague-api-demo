import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"

import { useAppSearch } from "@/lib/search"
import { CompetitionSeasonControls } from "./competition-season-controls"

export function AppShell({ children }: { children: ReactNode }) {
  const search = useAppSearch()

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
          <Link
            to="/"
            search={search}
            className="font-serif text-lg font-semibold tracking-tight"
          >
            EuroLeague API Demo
          </Link>
          <CompetitionSeasonControls />
        </div>
      </header>

      <main className="container mx-auto w-full flex-1 px-4 py-6">{children}</main>

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
        SDK. Unofficial; not affiliated with EuroLeague Basketball.
      </footer>
    </div>
  )
}
