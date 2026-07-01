import * as React from "react"
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"

import type { RouterContext } from "../router"
import { appSearchSchema } from "@/lib/search"
import { AppShell } from "@/components/app/app-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import appCss from "../styles.css?url"

const devtoolsEnabled =
  import.meta.env.DEV && import.meta.env.VITE_DISABLE_DEVTOOLS !== "true"

const Devtools = devtoolsEnabled
  ? React.lazy(async () => {
      const [{ TanStackDevtools }, { TanStackRouterDevtoolsPanel }] =
        await Promise.all([
          import("@tanstack/react-devtools"),
          import("@tanstack/react-router-devtools"),
        ])

      return {
        default: function TanStackDevtoolsRoot() {
          return (
            <TanStackDevtools
              config={{
                position: "bottom-right",
              }}
              plugins={[
                {
                  name: "Tanstack Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          )
        },
      }
    })
  : null

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

function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="dark" storageKey="theme">
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
        {Devtools ? (
          <React.Suspense fallback={null}>
            <Devtools />
          </React.Suspense>
        ) : null}
        <Scripts />
      </body>
    </html>
  )
}
