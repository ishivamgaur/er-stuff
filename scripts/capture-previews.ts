import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import mongoose from "mongoose"
import { chromium, type Browser, type Page } from "@playwright/test"
import { getMongoUri } from "../src/lib/db/connect.ts"
import { ToolModel } from "../src/models/tool.ts"

const OUTPUT_DIR = path.resolve("public/previews")
const FAVICON_DIR = path.resolve("public/favicons")
const VIEWPORT = { width: 1280, height: 800 } as const
const CONCURRENCY = 3
const NAVIGATION_TIMEOUT = 20_000

const ACCEPT_SELECTORS = [
  'button:has-text("Accept all")',
  'button:has-text("Accept All")',
  'button:has-text("I agree")',
  'button:has-text("Accept")',
  'button:has-text("Got it")',
]

type CaptureResult = { screenshot: boolean; favicon: boolean }

const dismissOverlays = async (page: Page) => {
  for (const selector of ACCEPT_SELECTORS) {
    try {
      const button = page.locator(selector).first()
      if (await button.isVisible({ timeout: 400 })) {
        await button.click({ timeout: 800 })
        await page.waitForTimeout(250)
        return
      }
    } catch {
      continue
    }
  }
}

const settle = async (page: Page) => {
  await page.waitForLoadState("domcontentloaded", { timeout: NAVIGATION_TIMEOUT })
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => undefined)
  await dismissOverlays(page)
  await page.waitForTimeout(900)
}

const captureFavicon = async (page: Page, slug: string): Promise<boolean> => {
  const candidates = await page.evaluate(() => {
    const links = [...document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]')]
      .map((link) => link.href)
      .filter(Boolean)

    return links.length > 0 ? links : ["/favicon.ico"]
  })

  for (const href of candidates.slice(0, 5)) {
    try {
      const url = new URL(href, page.url()).toString()
      const response = await page.request.get(url, { timeout: 8_000 })

      if (!response.ok()) continue

      const buffer = await response.body()
      if (buffer.byteLength < 100) continue

      await writeFile(path.join(FAVICON_DIR, `${slug}.ico`), buffer)
      return true
    } catch {
      continue
    }
  }

  return false
}

const capture = async (browser: Browser, slug: string, url: string): Promise<CaptureResult> => {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: "dark",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  })

  try {
    const page = await context.newPage()

    await page.goto(url, { waitUntil: "commit", timeout: NAVIGATION_TIMEOUT })
    await settle(page)

    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${slug}.webp`),
      type: "webp",
      quality: 72,
    })

    const favicon = await captureFavicon(page, slug)

    return { screenshot: true, favicon }
  } catch {
    return { screenshot: false, favicon: false }
  } finally {
    await context.close()
  }
}

const main = async () => {
  await mkdir(OUTPUT_DIR, { recursive: true })
  await mkdir(FAVICON_DIR, { recursive: true })
  await mongoose.connect(getMongoUri(), { bufferCommands: false })

  const tools = await ToolModel.find({ status: "published" })
    .select({ slug: 1, websiteUrl: 1 })
    .lean<Array<{ slug: string; websiteUrl: string }>>()

  process.stdout.write(`Capturing ${tools.length} sites\n`)

  const browser = await chromium.launch()
  const queue = [...tools]
  const results: Array<{ slug: string } & CaptureResult> = []

  const worker = async () => {
    for (;;) {
      const tool = queue.shift()
      if (!tool) return

      const result = await capture(browser, tool.slug, tool.websiteUrl)
      results.push({ slug: tool.slug, ...result })

      const shot = result.screenshot ? "shot" : "----"
      const icon = result.favicon ? "icon" : "----"
      process.stdout.write(`${shot} ${icon}  ${tool.slug}\n`)
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))
  await browser.close()

  await ToolModel.bulkWrite(
    results.map((result) => ({
      updateOne: {
        filter: { slug: result.slug },
        update: {
          $set: {
            previewImageUrl: result.screenshot ? `/previews/${result.slug}.webp` : null,
            logoUrl: result.favicon ? `/favicons/${result.slug}.ico` : null,
          },
        },
      },
    })),
  )

  const shots = results.filter((result) => result.screenshot).length
  const icons = results.filter((result) => result.favicon).length

  process.stdout.write(
    `screenshots ${shots}/${results.length}  favicons ${icons}/${results.length}\n`,
  )

  await mongoose.disconnect()
}

await main()
