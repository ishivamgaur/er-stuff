import { chromium, type Browser } from "playwright"

/**
 * Auth checks.
 *
 * Auth is Google only, per D30, so this cannot test the credential flow itself.
 * Verifying that needs real Google OAuth credentials and a consent screen, and
 * until those exist the flow is genuinely unverified end to end. This file
 * asserts everything that CAN be checked without them, which is the guard rails
 * and the fact that no password path has crept back in.
 */
const BASE = "http://localhost:3000"
const results: string[] = []
const check = (name: string, pass: boolean, detail = "") => {
  const line = `${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` -- ${detail}` : ""}`
  results.push(line)
  console.log(line)
}

const browser: Browser = await chromium.launch()

// 1. No password form anywhere in the auth surface
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  for (const path of ["/signin", "/signup"]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" })
    check(`${path} renders`, page.url().includes(path))
    check(
      `${path} has no password input`,
      (await page.locator('input[type="password"]').count()) === 0,
    )
    check(
      `${path} is not indexable`,
      ((await page.locator('meta[name="robots"]').getAttribute("content")) ?? "").includes(
        "noindex",
      ),
    )
  }
  await page.close()
}

// 2. Without credentials the page says so instead of offering a broken button
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(`${BASE}/signin`, { waitUntil: "networkidle" })
  const text = await page.locator("main").innerText()
  const hasGoogleButton = (await page.getByRole("button", { name: /Google/i }).count()) > 0
  const explains = text.includes("not switched on") || hasGoogleButton
  check(
    "sign in either works or explains why it does not",
    explains,
    hasGoogleButton ? "google button present" : "explained as unavailable",
  )
  await page.close()
}

// 3. Protected routes never leak content to an anonymous visitor
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  const protectedPaths = ["/submit", "/account", "/admin/reviews"]

  for (const path of protectedPaths) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" })
    check(`anonymous ${path} redirects to signin`, page.url().includes("/signin"), page.url())
  }

  // and the content really is absent, not just hidden behind a client redirect
  await page.goto(`${BASE}/admin/reviews`, { waitUntil: "networkidle" })
  const leaked = (await page.locator("main").innerText()).includes("Reviews")
  check("review queue content is not served anonymously", !leaked)
  await context.close()
}

// 4. The guarded markup is absent from the raw response, not merely hidden
// after a client redirect. Next's redirect() in a Server Component answers a
// document request with 200 and a redirect, so the status code proves nothing.
// What matters is that the protected content never reaches the browser.
{
  const markers: Array<[string, string]> = [
    ["/submit", "New submission"],
    ["/account", "signed in as"],
    ["/admin/reviews", "pending"],
  ]

  for (const [path, marker] of markers) {
    const response = await fetch(`${BASE}${path}`, { redirect: "manual" })
    const body = await response.text()
    check(`${path} does not serve guarded content`, !body.includes(marker), `"${marker}"`)
  }
}

await browser.close()

console.log(`\n${results.filter((l) => l.startsWith("PASS")).length}/${results.length} passed`)
console.log("NOT VERIFIED: the Google sign in flow itself, which needs OAuth credentials.")
if (results.some((l) => l.startsWith("FAIL"))) process.exit(1)
