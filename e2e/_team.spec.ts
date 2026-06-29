import { test, expect } from "@playwright/test"
import { mkdirSync } from "node:fs"

// Console noise that is not an app defect (mirrors smoke.spec.ts).
const IGNORE = [/React DevTools/i, /Download the React/i, /\[vite\]/i, /tanstack/i]

mkdirSync("e2e/screenshots", { recursive: true })

test("team route: header, roster and advanced stats", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error" && !IGNORE.some((re) => re.test(msg.text()))) {
      errors.push(msg.text())
    }
  })
  page.on("pageerror", (err) => errors.push(err.message))

  await page.goto("/team/OLY?competition=euroleague&season=2025", {
    waitUntil: "networkidle",
  })

  await expect(page.getByText("Olympiacos").first()).toBeVisible({ timeout: 20_000 })

  // Roster is the default tab — capture it for verification before switching.
  await expect(page.getByRole("heading", { name: "Players" })).toBeVisible({ timeout: 20_000 })
  await page.screenshot({ path: "e2e/screenshots/team-roster.png", fullPage: true })

  await page.getByRole("tab", { name: "Stats" }).click()
  await expect(page.getByText("Net Rating").first()).toBeVisible({ timeout: 20_000 })

  await page.screenshot({ path: "e2e/screenshots/team.png", fullPage: true })

  expect(errors, `console errors on /team/OLY:\n${errors.join("\n")}`).toEqual([])
})
