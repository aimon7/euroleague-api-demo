import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Project pages are served from https://aimon7.github.io/euroleague-api-demo/.
// Use that base for production builds; keep "/" in dev so the local server is simple.
const config = defineConfig(async ({ command }) => {
  const plugins = [
    tailwindcss(),
    tanstackStart({ spa: { enabled: true } }),
    viteReact(),
  ]

  if (command === "serve") {
    const { devtools } = await import("@tanstack/devtools-vite")
    plugins.unshift(devtools())
  }

  return {
    base: command === "build" ? "/euroleague-api-demo/" : "/",
    resolve: { tsconfigPaths: true },
    plugins,
  }
})

export default config
