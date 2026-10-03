import { chromium } from "playwright"

/**
 * The sidebar outline box must travel, not teleport and not blink.
 *
 * Three failure modes this catches, none of which typecheck or lint can see:
 * - the box stays on the active row and hover does nothing
 * - the box snaps with no transition, because the transition class was dropped
 * - the box and the active row disagree, because both draw an outline
 */

const results: string[] = []

const check = (name: string, pass: boolean, detail = "") => {
  results.push(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` -- ${detail}` : ""}`)
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await context.newPage()

await page.goto("http://localhost:3000/explore", { waitUntil: "networkidle" })

const box = page.locator('[data-testid="rail-nav-outline"]')
const boxY = async () => {
  const bb = await box.boundingBox()
  return bb === null ? null : bb.y
}

/**
 * Subpixel layout means two measurements of the same row can differ by a
 * fraction, so positions are compared with a 1px tolerance. Anything larger is
 * a real disagreement.
 */
const near = (a: number | null, b: number | null) =>
  a !== null && b !== null && Math.abs(a - b) <= 1

check("outline box present", (await box.count()) === 1)

// The box must be sized like a row, not collapsed to nothing.
const restingBox = await box.boundingBox()
check(
  "outline is one row tall",
  restingBox !== null && restingBox.height >= 26 && restingBox.height <= 30,
  `h=${restingBox?.height ?? "null"}`,
)

const atRest = await boxY()

// Hover a row that is not the active one and read the box mid flight.
const target = page.locator('[data-nav-href="/categories/database"]')
const targetY = (await target.boundingBox())?.y ?? 0
await target.hover()
await page.waitForTimeout(90)
const midFlight = await boxY()
// The glide runs 400ms, so anything shorter reads the box mid travel.
await page.waitForTimeout(600)
const afterHover = await boxY()

check(
  "box moves on hover",
  !near(atRest, targetY) && near(afterHover, targetY),
  `rest=${atRest} target=${targetY} after=${afterHover}`,
)
check(
  "box is still travelling at 90ms, so it glides",
  midFlight !== null &&
    afterHover !== null &&
    !near(midFlight, afterHover) &&
    !near(midFlight, atRest),
  `mid=${midFlight} end=${afterHover}`,
)

// Leaving the rail must return the box to the current section, not blank it.
await page.mouse.move(900, 600)
await page.waitForTimeout(600)
check(
  "box returns to the current section",
  near(await boxY(), atRest),
  `after leave=${await boxY()} rest=${atRest}`,
)

// Exactly one box, so the active row and the indicator cannot disagree.
const outlinedRows = await page.evaluate(`
  (() => {
    let n = 0
    for (const row of document.querySelectorAll('[data-nav-href]')) {
      const s = getComputedStyle(row)
      if (s.outlineStyle !== "none" || s.boxShadow !== "none") n += 1
    }
    return n
  })()
`)
check("no row draws its own outline", outlinedRows === 0, `outlined rows=${outlinedRows}`)

// Clicking must land the box on the section that is now current.
await page.locator('[data-nav-href="/categories/ai"]').click()
await page.waitForTimeout(700)
const aiY = (await page.locator('[data-nav-href="/categories/ai"]').boundingBox())?.y ?? 0
check("box follows the click", near(await boxY(), aiY), `box=${await boxY()} ai=${aiY}`)

// Keyboard focus must move it too, otherwise the box is mouse only.
await page.locator('[data-nav-href="/categories/database"]').focus()
await page.waitForTimeout(600)
const dbY = (await page.locator('[data-nav-href="/categories/database"]').boundingBox())?.y ?? 0
check("box follows keyboard focus", near(await boxY(), dbY), `box=${await boxY()} db=${dbY}`)

// Written outside the repo so a check run never leaves an untracked file behind.
await page.screenshot({
  path: "C:/Users/1by20/AppData/Local/Temp/opencode/nav-glide.png",
  clip: { x: 0, y: 0, width: 300, height: 620 },
})

console.log(results.join("\n"))
const failed = results.filter((r) => r.startsWith("FAIL")).length
console.log(`\n${results.length - failed}/${results.length} passed`)

await browser.close()
process.exit(failed === 0 ? 0 : 1)
