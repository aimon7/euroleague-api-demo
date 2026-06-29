import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Project pages are served from https://aimon7.github.io/euroleague-api-demo/.
// Use that base for production builds; keep "/" in dev so the local server is simple.
const config = defineConfig(({ command }) => ({
  base: command === "build" ? "/euroleague-api-demo/" : "/",
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({ spa: { enabled: true } }),
    viteReact(),
  ],
}))

export default config
