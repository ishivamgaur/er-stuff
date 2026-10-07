import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, sep as pathSep } from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = join(process.cwd(), "src")

const collect = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) return collect(path)
    return entry.endsWith(".tsx") ? [path] : []
  })

/**
 * One type scale, declared once in globals.css. Text that reaches for a size
 * outside it is the single biggest reason a UI reads as assembled rather than
 * designed, and it is invisible in a screenshot, so it needs a check.
 */
const SCALE = ["micro", "tiny", "small", "body", "lead", "title", "display", "hero"] as const

describe("type scale", () => {
  const files = collect(ROOT)
  const css = readFileSync(join(ROOT, "app", "globals.css"), "utf8")

  it("every step in the scale is defined in globals.css", () => {
    for (const step of SCALE) {
      expect(css).toMatch(new RegExp(`--text-${step}:`))
    }
  })

  it("declares no step outside the scale", () => {
    const declared = [...css.matchAll(/--text-([a-z]+)\s*:/g)].map((m) => m[1] as string)
    for (const name of declared) {
      expect(SCALE as readonly string[]).toContain(name)
    }
  })

  it("never uses an arbitrary pixel size for text", () => {
    const offenders: string[] = []

    for (const file of files) {
      const source = readFileSync(file, "utf8")
      for (const match of source.matchAll(/text-\[(\d+)px\]/g)) {
        offenders.push(`${relative(ROOT, file).split(pathSep).join("/")}: text-[${match[1]}px]`)
      }
    }

    expect(offenders).toEqual([])
  })
})
