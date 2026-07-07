import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { GuidePanel } from "@/components/docs/guide-panel"
import { PlaygroundPanel } from "@/components/docs/playground-panel"
import { ReferencePanel } from "@/components/docs/reference-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DocsSearch, DocsTab } from "@/lib/docs-search"
import {
  buildDocsSearch,
  docsSearchSchema,
  docsTab,
} from "@/lib/docs-search"
import { useAppSearch } from "@/lib/search"
import type { ResourceName } from "@/lib/docs/types"

export const Route = createFileRoute("/docs")({
  validateSearch: docsSearchSchema,
  component: DocsRoute,
})

function DocsRoute() {
  const search = Route.useSearch()
  const { competition, season } = useAppSearch()
  const navigate = useNavigate({ from: "/docs" })

  const setTab = (value: string) => {
    void navigate({
      search: (prev: DocsSearch) =>
        buildDocsSearch({
          competition: prev.competition,
          season: prev.season,
          tab: value === "reference" || value === "playground" ? value : "guide",
          resource: prev.resource,
          method: prev.method,
        }),
    })
  }

  const setPlaygroundSelection = (resource: ResourceName, method: string) => {
    void navigate({
      search: (prev: DocsSearch) =>
        buildDocsSearch({
          competition: prev.competition,
          season: prev.season,
          tab: "playground",
          resource,
          method,
        }),
    })
  }

  const setReferenceResource = (resource: ResourceName) => {
    void navigate({
      search: (prev: DocsSearch) =>
        buildDocsSearch({
          competition: prev.competition,
          season: prev.season,
          tab: "reference",
          resource,
          method: undefined,
        }),
    })
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          SDK docs
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Install guide, method reference, and a live playground for every{" "}
          <span className="font-medium text-foreground">euroleague-api</span>{" "}
          resource. Competition and season in the header apply as playground
          defaults.
        </p>
      </section>

      <Tabs value={docsTab(search)} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="guide">Guide</TabsTrigger>
          <TabsTrigger value="reference">Reference</TabsTrigger>
          <TabsTrigger value="playground">Playground</TabsTrigger>
        </TabsList>

        <TabsContent value="guide">
          <GuidePanel />
        </TabsContent>

        <TabsContent value="reference">
          <ReferencePanel
            competition={competition}
            season={season}
            resource={search.resource}
            onResourceChange={setReferenceResource}
          />
        </TabsContent>

        <TabsContent value="playground">
          <PlaygroundPanel
            competition={competition}
            season={season}
            resource={search.resource}
            method={search.method}
            onSelectionChange={setPlaygroundSelection}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
