import { chromium, type Page } from "@playwright/test"

const BASE = "http://localhost:3000"
const OUT = `${process.env.TEMP}/opencode/nav-glide.png`

let failures = 0
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` -- ${detail}` : ""}`)
  if (!ok) failures += 1
}

const rowBox = (page: Page, href: string) =>
  page.evaluate((target: string) => {
    const el = document.querySelector(`aside [data-nav-href="${target}"]`)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { top: r.top, height: r.height }
  }, href)

const glideBox = (page: Page) =>
  page.evaluate(() => {
    const el = document.querySelector('aside [data-testid="sidebar-glide"]')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { top: r.top, height: r.height, opacity: getComputedStyle(el).opacity }
  })

const currentSection = (page: Page) =>
  page.locator('aside [aria-current="location"]').getAttribute("data-nav-href")

const run = async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 })
  await page.waitForTimeout(800)

  const rows = await page.locator("aside [data-nav-href]").count()
  check("rows carry data-nav-href", rows >= 14, `${rows} rows`)

  const current = await page.locator('aside [aria-current="page"]').all()
  check("exactly one current nav row on /", current.length === 1, `${current.length}`)

  const sections = await page.locator('aside nav[aria-label="Sections"] a').count()
  check("the Sections block lists Build's sections", sections === 7, `${sections}`)

  const glides = await page.locator('aside [data-testid="sidebar-glide"]').count()
  check("exactly one glide box", glides === 1, `${glides}`)

  // No row paints its own fill; the box owns the mark.
  const fills = await page.evaluate(() => {
    const bad: string[] = []
    for (const el of document.querySelectorAll("aside [data-nav-href]")) {
      const bg = getComputedStyle(el).backgroundColor
      if (!["rgba(0, 0, 0, 0)", "transparent"].includes(bg)) {
        bad.push(`${(el as HTMLElement).dataset.navHref}=${bg}`)
      }
    }
    return bad
  })
  check("no row draws its own fill", fills.length === 0, fills.join(", "))

  // The box rests on the active section — the scroll-spy's answer to "where
  // am I" — not on the nav row, which keeps only its text emphasis.
  const restingHref = await currentSection(page)
  const rest = restingHref ? await rowBox(page, restingHref) : null
  const restGlide = await glideBox(page)
  const rests =
    rest !== null &&
    restGlide !== null &&
    Math.abs(rest.top - restGlide.top) < 2 &&
    Math.abs(rest.height - restGlide.height) < 2
  check(
    "the box rests on the active section",
    rests,
    JSON.stringify({ restingHref, rest, restGlide }),
  )

  // Hover a section further down: mid-flight the box must be strictly between.
  const from = restingHref ? ((await rowBox(page, restingHref))?.top ?? 0) : 0
  const to = (await rowBox(page, "#git-review"))?.top ?? 0
  await page.locator('aside [data-nav-href="#git-review"]').hover({ force: true })
  await page.waitForTimeout(110)
  const mid = await glideBox(page)
  const gliding =
    mid !== null && ((mid.top > from && mid.top < to) || (mid.top > to && mid.top < from))
  check("the box glides between rows", gliding, JSON.stringify({ from, mid: mid?.top, to }))
  await page.waitForTimeout(500)
  const landed = await glideBox(page)
  check(
    "the box lands on the hovered row",
    landed !== null && Math.abs(landed.top - to) < 2,
    JSON.stringify(landed?.top),
  )

  // Hover across the blocks: section row back up to a nav row.
  const navTo = (await rowBox(page, "/data"))?.top ?? 0
  await page.locator('aside [data-nav-href="/data"]').hover({ force: true })
  await page.waitForTimeout(500)
  const crossLanded = await glideBox(page)
  check(
    "the box travels between the two blocks",
    crossLanded !== null && Math.abs(crossLanded.top - navTo) < 2,
    JSON.stringify(crossLanded?.top),
  )

  await page.locator('aside [data-nav-href="/data"]').click()
  await page.waitForURL(`${BASE}/data`, { timeout: 15000 })
  // The pointer is still sitting on the row that was just clicked, and hover
  // correctly outranks the active section — so move it off the rail before
  // asking where the box rests.
  await page.mouse.move(700, 500)
  await page.waitForTimeout(600)
  const moved = await page.locator('aside [aria-current="page"]').all()
  const movedHref = moved.length === 1 ? await moved[0]?.getAttribute("data-nav-href") : null
  const dataSections = await page.locator('aside nav[aria-label="Sections"] a').allInnerTexts()
  const movedRestHref = await currentSection(page)
  const movedBox = movedRestHref ? await rowBox(page, movedRestHref) : null
  const movedGlide = await glideBox(page)
  check(
    "navigation moves current, sections and box together",
    moved.length === 1 &&
      movedHref === "/data" &&
      dataSections.some((text) => text.includes("SQL")) &&
      movedBox !== null &&
      movedGlide !== null &&
      Math.abs(movedGlide.top - movedBox.top) < 2,
    String(movedHref),
  )

  // A section row is a hash link: it changes the fragment, not the route.
  await page.locator('aside [data-nav-href="#storage-files"]').click()
  await page.waitForTimeout(1600) // let Lenis finish gliding before the next scroll
  const hashUrl = page.url()
  check(
    "a section row sets the hash without leaving the route",
    hashUrl.endsWith("#storage-files") && hashUrl.startsWith(`${BASE}/data`),
    hashUrl,
  )

  // Scroll-spy: put a section under the reading band and the mark follows.
  await page.evaluate(() => {
    document.getElementById("search")?.scrollIntoView()
  })
  await page.waitForTimeout(700)
  const spiedHref = await currentSection(page)
  check("the scroll-spy follows the reader", spiedHref === "#search", String(spiedHref))

  await page.focus('aside [data-nav-href="/ai"]')
  await page.waitForTimeout(500)
  const focused = await page.evaluate(
    () => (document.activeElement as HTMLElement | null)?.dataset.navHref ?? null,
  )
  const focusGlide = await glideBox(page)
  const focusBox = await rowBox(page, "/ai")
  check(
    "the box follows keyboard focus",
    focused === "/ai" &&
      focusGlide !== null &&
      focusBox !== null &&
      Math.abs(focusGlide.top - focusBox.top) < 2,
    String(focused),
  )

  // Off the nav routes there is no section block and no active row: the box
  // hides rather than pretending to a position.
  await page.goto(`${BASE}/free`, { waitUntil: "networkidle", timeout: 60000 })
  await page.waitForTimeout(700)
  const freeSectionRows = await page.locator('aside [data-nav-href^="#"]').count()
  const freeCurrent = await page.locator('aside [aria-current="page"]').count()
  const freeGlide = await glideBox(page)
  check(
    "non-nav pages drop the section block and the mark",
    freeSectionRows === 0 && freeCurrent === 0 && (freeGlide?.opacity ?? "1") === "0",
    JSON.stringify({ freeSectionRows, freeCurrent, freeGlide }),
  )

  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 })
  await page.waitForTimeout(800)
  await page.screenshot({ path: OUT })
  await browser.close()

  console.log(failures === 0 ? "nav checks passed" : `${failures} nav checks failed`)
  process.exit(failures === 0 ? 0 : 1)
}

run()
