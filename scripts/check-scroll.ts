import { chromium } from "@playwright/test"

const BASE = "http://localhost:3000"

let failures = 0
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` -- ${detail}` : ""}`)
  if (!ok) failures += 1
}

/*
 * Lenis owns the window wheel, so every nested scroller must carry
 * `data-lenis-prevent` or the wheel scrolls the page behind it — or nowhere
 * when body scroll is locked. AGENTS.md 5.25. These three probes each force
 * an overflow and wheel over the container itself.
 */
const run = async () => {
  const browser = await chromium.launch()

  // Drawer list, short phone viewport so it overflows with body locked.
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 450 } })
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 })
    await page.getByRole("button", { name: "Open navigation" }).click()
    await page.getByRole("button", { name: "Close navigation" }).waitFor({ timeout: 5000 })
    const list = page.locator('[role="dialog"] .overflow-y-auto')
    const max = await list.evaluate((el) => el.scrollHeight - el.clientHeight)
    await list.hover({ force: true })
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(600)
    const top = await list.evaluate((el) => el.scrollTop)
    check("drawer list scrolls under a locked body", max > 0 && top > 0, `max=${max} top=${top}`)
    await page.close()
  }

  // Desktop rail, short viewport so its sections overflow.
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 400 } })
    await page.goto(`${BASE}/data`, { waitUntil: "networkidle", timeout: 60000 })
    await page.waitForTimeout(500)
    const rail = page.locator("aside .overflow-y-auto")
    const max = await rail.evaluate((el) => el.scrollHeight - el.clientHeight)
    await rail.hover({ force: true })
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(600)
    const top = await rail.evaluate((el) => el.scrollTop)
    check("rail scrolls instead of the page behind it", max > 0 && top > 0, `max=${max} top=${top}`)
    await page.close()
  }

  // Palette results.
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 })
    await page.keyboard.press("ControlOrMeta+k")
    await page.locator('[role="dialog"] input').fill("a")
    await page.waitForTimeout(500)
    const list = page.locator('[role="dialog"] [cmdk-list]')
    const max = await list.evaluate((el) => el.scrollHeight - el.clientHeight)
    await list.hover({ force: true })
    await page.mouse.wheel(0, 600)
    await page.waitForTimeout(600)
    const top = await list.evaluate((el) => el.scrollTop)
    check("palette results scroll", max > 0 && top > 0, `max=${max} top=${top}`)
    await page.close()
  }

  // Route change resets the page scroll.
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 400 } })
    await page.goto(`${BASE}/data`, { waitUntil: "networkidle", timeout: 60000 })
    await page.waitForTimeout(500)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await page.waitForTimeout(800)
    const before = await page.evaluate(() => Math.round(window.scrollY))
    await page.locator('aside nav[aria-label="Navigation"] a[href="/ai"]').click()
    await page.waitForURL(`${BASE}/ai`, { timeout: 15000 })
    await page.waitForTimeout(1200)
    const after = await page.evaluate(() => Math.round(window.scrollY))
    check("navigation resets page scroll", before > 300 && after < 100, `${before} -> ${after}`)
    await page.close()
  }

  // Section anchor glides the section under the sticky toolbar (56px).
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 400 } })
    await page.goto(`${BASE}/data`, { waitUntil: "networkidle", timeout: 60000 })
    await page.waitForTimeout(500)
    await page.locator('aside nav[aria-label="Sections"] a[href="#storage-files"]').click()
    await page.waitForTimeout(1800)
    const top = await page.evaluate(
      () => document.getElementById("storage-files")?.getBoundingClientRect().top ?? null,
    )
    check(
      "section anchor lands under the toolbar",
      top !== null && top >= 40 && top <= 120,
      String(top),
    )
    await page.close()
  }

  await browser.close()

  console.log(failures === 0 ? "scroll checks passed" : `${failures} scroll checks failed`)
  process.exit(failures === 0 ? 0 : 1)
}

run()
