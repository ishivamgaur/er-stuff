import { chromium } from "playwright"

const MOBILE = { width: 390, height: 844 }
const results: string[] = []

const check = (name: string, pass: boolean, detail = "") => {
  results.push(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` -- ${detail}` : ""}`)
}

const hasHorizontalOverflow = async (page: import("playwright").Page): Promise<boolean> =>
  page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  )

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: MOBILE, deviceScaleFactor: 2 })
const page = await context.newPage()

await page.goto("http://localhost:3000/explore", { waitUntil: "networkidle" })

// Drawer starts closed
check("drawer hidden on load", (await page.locator('[role="dialog"]').count()) === 0)

// No horizontal overflow across the key mobile widths
for (const width of [360, 390, 414]) {
  await page.setViewportSize({ width, height: 844 })
  await page.waitForTimeout(120)
  const overflow = await hasHorizontalOverflow(page)
  check(`no horizontal overflow at ${width}px`, !overflow)
}

await page.setViewportSize(MOBILE)
await page.waitForTimeout(120)

// Trigger is reachable and labelled
const trigger = page.getByRole("button", { name: "Open navigation" })
check("open trigger visible", await trigger.isVisible())
check("open trigger labelled", (await trigger.getAttribute("aria-expanded")) === "false")

// Body scroll must be locked while open
const scrollBefore = await page.evaluate(() => getComputedStyle(document.body).overflow)
await trigger.click()
await page.waitForTimeout(300)

check(
  "body scroll locked when open",
  (await page.evaluate(() => getComputedStyle(document.body).overflow)) === "hidden",
  `before=${scrollBefore}`,
)

const dialog = page.locator('[role="dialog"]')
check("dialog present after open", (await dialog.count()) === 1)
check("dialog is modal", (await dialog.getAttribute("aria-modal")) === "true")

// Drawer must be fully on screen, not clipped
const box = await dialog.boundingBox()
check(
  "drawer within viewport width",
  box !== null && box.x >= -1 && box.x + box.width <= MOBILE.width + 1,
  JSON.stringify(box),
)
check(
  "drawer fills height",
  box !== null && Math.abs(box.height - MOBILE.height) < 2,
  `h=${box?.height}`,
)

// Focus moved into the drawer
const focusedInDrawer = await page.evaluate(() => {
  const active = document.activeElement
  const drawer = document.querySelector('[role="dialog"]')
  return Boolean(active && drawer && drawer.contains(active))
})
check("focus moved into drawer", focusedInDrawer)

// Navigation is actually reachable now
check("category links in drawer", (await dialog.getByRole("link").count()) >= 12)

// Navigating closes the drawer
await dialog
  .getByRole("link", { name: /Database/ })
  .first()
  .click()
await page.waitForURL(/\/categories\//, { timeout: 10_000 })
await page.waitForTimeout(300)
check("drawer closed after navigation", (await page.locator('[role="dialog"]').count()) === 0)
check(
  "body scroll restored",
  (await page.evaluate(() => getComputedStyle(document.body).overflow)) !== "hidden",
)

// Reopen, dismiss with Escape
await page.getByRole("button", { name: "Open navigation" }).click()
await page.waitForTimeout(300)
await page.keyboard.press("Escape")
await page.waitForTimeout(200)
check("escape closes drawer", (await page.locator('[role="dialog"]').count()) === 0)
check(
  "body scroll restored after escape",
  (await page.evaluate(() => getComputedStyle(document.body).overflow)) !== "hidden",
)
check(
  "focus returned to trigger",
  await page
    .getByRole("button", { name: "Open navigation" })
    .evaluate((el) => el === document.activeElement),
)

// Backdrop click closes
await page.getByRole("button", { name: "Open navigation" }).click()
await page.waitForTimeout(300)
await page.mouse.click(370, 700)
await page.waitForTimeout(250)
check("backdrop click closes drawer", (await page.locator('[role="dialog"]').count()) === 0)

// Desktop keeps the persistent rail, not the drawer
await page.setViewportSize({ width: 1280, height: 900 })
await page.goto("http://localhost:3000/explore", { waitUntil: "networkidle" })
await page.waitForTimeout(200)
check("rail visible on desktop", await page.locator("aside").isVisible())
check(
  "drawer trigger hidden on desktop",
  !(await page.getByRole("button", { name: "Open navigation" }).isVisible()),
)

// Mobile tool page must not overflow either
await page.setViewportSize(MOBILE)
for (const path of ["/free", "/categories"]) {
  await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle" })
  await page.waitForTimeout(150)
  check(`no horizontal overflow on ${path}`, !(await hasHorizontalOverflow(page)))
}

await browser.close()

console.log(results.join("\n"))
const failures = results.filter((line) => line.startsWith("FAIL"))
console.log(`\n${results.length - failures.length}/${results.length} passed`)
if (failures.length > 0) process.exit(1)
