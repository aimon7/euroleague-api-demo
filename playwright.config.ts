import { defineConfig, devices } from "@playwright/test"

// Headless browser verification for every route. Runs against the dev server for
// fast iteration; the deploy step additionally verifies the built dist with the
// Pages base path. This is our stand-in for an interactive DevTools session:
// it asserts a clean console and captures a screenshot as evidence per route.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      VITE_DISABLE_DEVTOOLS: "true",
    },
  },
})
