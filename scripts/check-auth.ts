import { chromium } from "playwright"

const BASE = "http://localhost:3000"
const results: string[] = []
const check = (name: string, pass: boolean, detail = "") => {
  const line = `${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` -- ${detail}` : ""}`
  results.push(line)
  console.log(line)
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await context.newPage()

const email = `tester+${Date.now()}@erstuff.test`
const password = "correct-horse-battery-staple"

// 1. Sign up
await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" })
await page.fill('input[name="email"]', email)
await page.fill('input[name="password"]', password)
await page.locator('form button[type="submit"]').last().click()
await page.waitForURL(/\/(account|submit)/, { timeout: 20_000 }).catch(() => undefined)
check("sign up lands on an authenticated page", /\/(account|submit)/.test(page.url()), page.url())

// 2. Session cookie is set and /account is reachable
await page.goto(`${BASE}/account`, { waitUntil: "networkidle" })
check("account page reachable after sign up", page.url().includes("/account"))
check("account shows the email", (await page.getByText(email).count()) > 0)

// 3. Submit a product
await page.goto(`${BASE}/submit`, { waitUntil: "networkidle" })
check("submit page reachable", page.url().includes("/submit"))
await page.fill('input[name="name"]', "Testly")
await page.fill('input[name="websiteUrl"]', `https://testly-${Date.now()}.example.com`)
await page.fill(
  'textarea[name="description"]',
  "A deliberately boring test product used to verify the submission queue works end to end.",
)
await page.check('input[name="categorySlugs"][value="backend"]')
await page.check('input[name="pricing"][value="free"]')
await page.locator('form button[type="submit"]').last().click()
await page.waitForTimeout(2500)
check("submission appears in the account list", (await page.getByText("Testly").count()) > 0)
check("submission status is pending, not verified", (await page.getByText("[pending]").count()) > 0)

// 4. Validation rejects a short description
await page.goto(`${BASE}/submit`, { waitUntil: "networkidle" })
await page.fill('input[name="name"]', "Too Short Co")
await page.fill('input[name="websiteUrl"]', "https://short.example.com")
await page.fill('textarea[name="description"]', "Too short")
await page.check('input[name="categorySlugs"][value="backend"]')
await page.locator('form button[type="submit"]').last().click()
await page.waitForTimeout(1200)
check("short description is rejected", (await page.getByRole("alert").count()) > 0)

// 5. Anonymous user is redirected away from /submit
const anon = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const anonPage = await anon.newPage()
await anonPage.goto(`${BASE}/submit`, { waitUntil: "networkidle" })
check("anonymous /submit redirects to signin", anonPage.url().includes("/signin"), anonPage.url())
await anonPage.goto(`${BASE}/account`, { waitUntil: "networkidle" })
check("anonymous /account redirects to signin", anonPage.url().includes("/signin"))
await anonPage.goto(`${BASE}/admin/reviews`, { waitUntil: "networkidle" })
check(
  "anonymous /admin/reviews is blocked",
  !anonPage.url().includes("/admin/reviews"),
  anonPage.url(),
)

// 6. Weak password rejected
await anonPage.goto(`${BASE}/signup`, { waitUntil: "networkidle" })
await anonPage.fill('input[name="email"]', `weak+${Date.now()}@erstuff.test`)
await anonPage.fill('input[name="password"]', "short")
await anonPage.click('button[type="submit"]')
await anonPage.waitForTimeout(1200)
check("short password is rejected", (await anonPage.getByRole("alert").count()) > 0)

// 7. Sign out
await page.goto(`${BASE}/account`, { waitUntil: "networkidle" })
await page
  .locator("main")
  .getByRole("button", { name: /sign out/i })
  .click()
await page.waitForTimeout(2000)
await page.goto(`${BASE}/account`, { waitUntil: "networkidle" })
check("sign out clears the session", page.url().includes("/signin"), page.url())

await browser.close()

console.log(results.join("\n"))
const failures = results.filter((line) => line.startsWith("FAIL"))
console.log(`\n${results.length - failures.length}/${results.length} passed`)
if (failures.length > 0) process.exit(1)
