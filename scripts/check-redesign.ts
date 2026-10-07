import { chromium } from "@playwright/test"

const BASE = "http://localhost:3000"
const OUT = process.env.TEMP + "/opencode"

let failures = 0
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` -- ${detail}` : ""}`)
  if (!ok) failures += 1
}

const run = async () => {
  const browser = await chromium.launch()

  for (const theme of ["dark", "light"] as const) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(String(err).slice(0, 200)))
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 })
    await page.evaluate((t) => {
      window.localStorage.setItem("theme", t)
      document.documentElement.classList.toggle("dark", t === "dark")
    }, theme)
    await page.waitForTimeout(1200)

    const body = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    check(
      `${theme} body background`,
      theme === "dark" ? body === "rgb(9, 9, 11)" : body === "rgb(250, 250, 250)",
      body,
    )

    const cta = await page.evaluate(() =>
      [...document.querySelectorAll('a[href="/signup"]')].map(
        (el) => getComputedStyle(el).backgroundColor,
      ),
    )
    const primary = theme === "dark" ? "rgb(222, 127, 156)" : "rgb(140, 29, 64)"
    check(`${theme} signup CTA is the accent`, cta.includes(primary), cta.join(" | "))

    const h1 = await page.locator("main h1").first().innerText()
    check(`${theme} h1 renders`, h1.length > 0, h1.slice(0, 40))

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    check(`${theme} no horizontal overflow`, overflow <= 0, String(overflow))

    check(`${theme} zero page errors`, errors.length === 0, errors.join(" | ").slice(0, 200))
    await page.screenshot({ path: `${OUT}/new-${theme}-home.png` })

    await page.goto(`${BASE}/data`, { waitUntil: "networkidle", timeout: 60000 })
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `${OUT}/new-${theme}-data.png` })

    await page.goto(`${BASE}/tools/supabase`, { waitUntil: "networkidle", timeout: 60000 })
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `${OUT}/new-${theme}-tool.png` })
    await page.close()
  }

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await mobile.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 })
  await mobile.waitForTimeout(1200)
  await mobile.screenshot({ path: `${OUT}/new-mobile-home.png` })
  await mobile.getByRole("button", { name: "Open navigation" }).click()
  await mobile.waitForTimeout(600)
  await mobile.screenshot({ path: `${OUT}/new-mobile-drawer.png` })
  await mobile.close()

  await browser.close()
  console.log(failures === 0 ? "smoke passed" : `${failures} smoke checks failed`)
  process.exit(failures === 0 ? 0 : 1)
}

run()
