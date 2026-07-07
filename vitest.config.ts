import { resolve } from "node:path"

import { defineConfig } from "vitest/config"

// Unit tests only. Playwright specs under e2e/ are run by `pnpm test:e2e`.
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
  },
})
