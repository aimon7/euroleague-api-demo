import { createRootRouteWithContext } from "@tanstack/react-router"

import type { RouterContext } from "../router"
import { appSearchSchema } from "@/lib/search"
import { RootLayout } from "@/routes/-root-layout"
import { RootDocument } from "@/routes/-root-document"
import appCss from "../styles.css?url"

export const Route = createRootRouteWithContext<RouterContext>()({
  validateSearch: appSearchSchema,
  component: RootLayout,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "EuroLeague API Demo",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  shellComponent: RootDocument,
})
