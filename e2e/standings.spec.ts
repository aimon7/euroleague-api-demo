import { test, expect } from "@playwright/test"

test("standings: 2025-26 season loads without error", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  page.on("pageerror", (err) => errors.push(err.message))

  await page.goto("/?competition=euroleague&season=2025", { waitUntil: "networkidle" })
  await page.getByRole("tab", { name: "Standings" }).click()

  await expect(page.getByRole("table")).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText("Resource not found")).not.toBeVisible()
  await expect(page.getByText(/Not found standings/)).not.toBeVisible()

  const rows = page.locator("tbody tr")
  await expect(rows.first()).toBeVisible()
  expect(await rows.count()).toBeGreaterThan(10)

  expect(errors.filter((e) => /standings|404|not found/i.test(e))).toEqual([])
})
