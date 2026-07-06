import { test, expect } from "@playwright/test"

test("standings: 2025-26 season loads without error", async ({ page }) => {
  const errors: string[] = []
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text())
  })
  page.on("pageerror", (err) => errors.push(err.message))

  await page.goto("/?competition=euroleague&season=2025&tab=standings", {
    waitUntil: "networkidle",
  })

  await expect(page.getByRole("tab", { name: "Standings" })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await expect(page.getByRole("columnheader", { name: "#" })).toBeVisible()
  await expect(page.getByRole("columnheader", { name: "Team" })).toBeVisible()
  await expect(page.getByRole("table")).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText("Resource not found")).not.toBeVisible()
  await expect(page.getByText(/Not found standings/)).not.toBeVisible()

  const rows = page.locator("tbody tr")
  await expect(rows.first()).toBeVisible()
  expect(await rows.count()).toBeGreaterThan(10)

  expect(
    errors.filter(
      (e) => /standings|404|not found/i.test(e) && !/CORS policy/i.test(e),
    ),
  ).toEqual([])
})

test("standings: shows skeleton rows while loading", async ({ page }) => {
  await page.route("**/api-live.euroleague.net/**", async (route) => {
    const url = route.request().url()
    if (url.includes("basicstandings") || url.includes("/rounds")) {
      await new Promise((resolve) => setTimeout(resolve, 2_000))
    }
    await route.continue()
  })

  await page.goto("/?competition=euroleague&season=2025&tab=standings")

  await expect(page.getByRole("columnheader", { name: "Team" })).toBeVisible()
  await expect(page.locator("tbody [data-slot=skeleton]").first()).toBeVisible({
    timeout: 5_000,
  })
})

test("landing tab: updates URL when switching tabs", async ({ page }) => {
  await page.goto("/?competition=euroleague&season=2025")

  await page.getByRole("tab", { name: "Standings" }).click()
  await expect(page).toHaveURL(/tab=standings/)

  await page.getByRole("tab", { name: "Clubs" }).click()
  await expect(page).not.toHaveURL(/tab=/)
})

test("team panel: deep link opens stats panel", async ({ page }) => {
  await page.goto("/team/OLY?competition=euroleague&season=2025&panel=stats", {
    waitUntil: "networkidle",
  })

  await expect(page.getByRole("tab", { name: "Stats" })).toHaveAttribute(
    "aria-selected",
    "true",
  )
})

test("team route: does not carry landing tab in URL", async ({ page }) => {
  await page.goto("/?competition=euroleague&season=2025&tab=standings")

  await expect(page.getByRole("tab", { name: "Standings" })).toHaveAttribute(
    "aria-selected",
    "true",
  )

  const teamLink = page
    .getByRole("tabpanel", { name: "Standings" })
    .getByRole("link")
    .first()
  await expect(teamLink).toBeVisible({ timeout: 15_000 })
  await teamLink.click()

  await expect(page).toHaveURL(/\/team\//)
  await expect(page).not.toHaveURL(/tab=/)
})
