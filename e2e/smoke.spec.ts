import { test, expect  } from "@playwright/test"
import type {Page} from "@playwright/test";
import { mkdirSync } from "node:fs"

// Routes verified on every run. As routes ship, add them here. Detail routes use a
// real code so live data renders (OLY = Olympiacos; 007143 = a real person code).
const ROUTES: Array<{ path: string; name: string; ready: (page: Page) => Promise<unknown> }> = [
  {
    path: "/",
    name: "landing",
    ready: (page) => page.locator('a[href*="/team/"]').first().waitFor({ timeout: 15_000 }),
  },
]

// Console noise that is not an app defect.
const IGNORE = [/React DevTools/i, /Download the React/i, /\[vite\]/i, /tanstack/i]

mkdirSync("e2e/screenshots", { recursive: true })

for (const route of ROUTES) {
  test(`smoke: ${route.name} (${route.path})`, async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error" && !IGNORE.some((re) => re.test(msg.text()))) {
        errors.push(msg.text())
      }
    })
    page.on("pageerror", (err) => errors.push(err.message))

    await page.goto(route.path, { waitUntil: "networkidle" })
    await route.ready(page)
    await page.screenshot({ path: `e2e/screenshots/${route.name}.png`, fullPage: true })

    expect(errors, `console errors on ${route.path}:\n${errors.join("\n")}`).toEqual([])
  })
}
