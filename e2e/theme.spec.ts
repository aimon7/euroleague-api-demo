import { test, expect } from "@playwright/test"

const IGNORE = [/React DevTools/i, /Download the React/i, /\[vite\]/i, /tanstack/i]

test.describe("theme toggle", () => {
  test("defaults to dark, switches themes, and persists", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error" && !IGNORE.some((re) => re.test(msg.text()))) {
        errors.push(msg.text())
      }
    })
    page.on("pageerror", (err) => errors.push(err.message))

    await page.goto("/", { waitUntil: "networkidle" })

    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect(page.locator("html")).not.toHaveClass(/light/)

    await page.getByRole("button", { name: "Change to light mode" }).click()
    await expect(page.locator("html")).toHaveClass(/light/)
    await expect(page.locator("html")).not.toHaveClass(/dark/)
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem("theme")))
      .toBe("light")

    await page.getByRole("button", { name: "Change to dark mode" }).click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await expect
      .poll(async () => page.evaluate(() => localStorage.getItem("theme")))
      .toBe("dark")

    await page.reload({ waitUntil: "networkidle" })
    await expect(page.locator("html")).toHaveClass(/dark/)

    expect(errors, `console errors during theme toggle:\n${errors.join("\n")}`).toEqual([])
  })
})
