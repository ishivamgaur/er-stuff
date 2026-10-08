import { chromium, type Page } from "@playwright/test"

const BASE = "http://localhost:3000"
const OUT = `${process.env.TEMP}/opencode/nav-rail.png`

let failures = 0
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` -- ${detail}` : ""}`)
  if (!ok) failures += 1
}

const currentSection = (page: Page) =>
  page.locator('aside [aria-current="location"]').getAttribute("href")

const run = async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 })
  await page.waitForTimeout(800)

  const navRows = await page.locator('aside nav[aria-label="Navigation"] a').count()
  check("the Navigation block lists seven routes", navRows === 7, `${navRows}`)

  const current = await page.locator('aside [aria-current="page"]').all()
  check("exactly one current nav row on /", current.length === 1, `${current.length}`)
  const activeColor =
    current.length === 1 ? await current[0]?.evaluate((el) => getComputedStyle(el).color) : null
  check(
    "the active row reads in the brand",
    activeColor === "rgb(47, 129, 247)",
    String(activeColor),
  )

  const sections = await page.locator('aside nav[aria-label="Sections"] a').count()
  check("the Sections block lists Build's sections", sections === 4, `${sections}`)

  // Regression guard: the floating mark is gone for good.
  const glides = await page.locator('aside [data-testid="sidebar-glide"]').count()
  check("no floating mark exists", glides === 0, `${glides}`)

  // State is type, never a fill — at rest...
  const fills = await page.evaluate(() => {
    const bad: string[] = []
    for (const el of document.querySelectorAll("aside nav a")) {
      const bg = getComputedStyle(el).backgroundColor
      if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent")
        bad.push(`${el.getAttribute("href")}=${bg}`)
    }
    return bad
  })
  check("no row draws its own fill", fills.length === 0, fills.join(", "))

  // ...and on hover: the colour shifts, the background must not.
  const target = 'aside nav[aria-label="Sections"] a[href="#git-review"]'
  const before = await page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const cs = getComputedStyle(el)
    return { color: cs.color, bg: cs.backgroundColor }
  }, target)
  await page.locator(target).hover({ force: true })
  await page.waitForTimeout(300)
  const after = await page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const cs = getComputedStyle(el)
    return { color: cs.color, bg: cs.backgroundColor }
  }, target)
  check(
    "hover shifts text colour only, never paints a fill",
    before !== null &&
      after !== null &&
      before.color !== after.color &&
      (after.bg === "rgba(0, 0, 0, 0)" || after.bg === "transparent") &&
      after.bg === before.bg,
    JSON.stringify({ before, after }),
  )

  await page.locator('aside nav[aria-label="Navigation"] a[href="/data"]').click()
  await page.waitForURL(`${BASE}/data`, { timeout: 15000 })
  const moved = await page.locator('aside [aria-current="page"]').all()
  const movedHref = moved.length === 1 ? await moved[0]?.getAttribute("href") : null
  const dataSections = await page.locator('aside nav[aria-label="Sections"] a').allInnerTexts()
  check(
    "navigation moves current and sections together",
    moved.length === 1 &&
      movedHref === "/data" &&
      dataSections.some((text) => text.includes("SQL")),
    String(movedHref),
  )

  // A section row is a hash link: it changes the fragment, not the route.
  await page.locator('aside nav[aria-label="Sections"] a[href="#storage-files"]').click()
  await page.waitForTimeout(1600) // let Lenis finish gliding before the next scroll
  const hashUrl = page.url()
  check(
    "a section row sets the hash without leaving the route",
    hashUrl.endsWith("#storage-files") && hashUrl.startsWith(`${BASE}/data`),
    hashUrl,
  )

  // Scroll-spy: put a section under the reading band and the current follows.
  await page.evaluate(() => {
    document.getElementById("search")?.scrollIntoView()
  })
  await page.waitForTimeout(700)
  const spiedHref = await currentSection(page)
  check("the scroll-spy follows the reader", spiedHref === "#search", String(spiedHref))

  await page.focus('aside nav[aria-label="Navigation"] a[href="/ai"]')
  await page.waitForTimeout(300)
  const focused = await page.evaluate(
    () => (document.activeElement as HTMLElement | null)?.getAttribute("href") ?? null,
  )
  const focusedFill = await page.evaluate(() => {
    const el = document.activeElement
    if (!(el instanceof Element)) return null
    return getComputedStyle(el).backgroundColor
  })
  check(
    "keyboard focus lands on the focused row without a fill",
    focused === "/ai" &&
      focusedFill !== null &&
      (focusedFill === "rgba(0, 0, 0, 0)" || focusedFill === "transparent"),
    JSON.stringify({ focused, focusedFill }),
  )

  // Off the nav routes there is no section block and no active row.
  await page.goto(`${BASE}/free`, { waitUntil: "networkidle", timeout: 60000 })
  await page.waitForTimeout(700)
  const freeSectionRows = await page.locator('aside nav[aria-label="Sections"] a').count()
  const freeCurrent = await page.locator('aside [aria-current="page"]').count()
  check(
    "non-nav pages drop the section block and the current row",
    freeSectionRows === 0 && freeCurrent === 0,
    JSON.stringify({ freeSectionRows, freeCurrent }),
  )

  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: OUT })
  await browser.close()

  console.log(failures === 0 ? "nav checks passed" : `${failures} nav checks failed`)
  process.exit(failures === 0 ? 0 : 1)
}

run()
