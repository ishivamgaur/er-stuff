import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, sep as pathSep } from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = join(process.cwd(), "src")
const CSS = join(ROOT, "app", "globals.css")

const collectFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) return collectFiles(path)
    return /\.(tsx?|ts|css)$/.test(entry) ? [path] : []
  })

const COLOR_PREFIXES = [
  "bg-",
  "text-",
  "border-",
  "ring-",
  "outline-",
  "fill-",
  "stroke-",
  "decoration-",
  "from-",
  "via-",
  "to-",
  "caret-",
  "divide-",
  "accent-",
  "shadow-",
  "placeholder-",
]

/**
 * Tailwind v4 silently drops utilities whose theme key is missing, so `bg-canvas`
 * or `text-ink-subtle` render as nothing at all with no build error and no test
 * failure. They are only visible in a screenshot, which is not a check.
 *
 * This walks every class-like string in src and fails on any colour utility
 * whose theme token is not defined in globals.css.
 */
describe("theme tokens", () => {
  const css = readFileSync(CSS, "utf8")

  const colorTokens = new Set(
    [...css.matchAll(/^\s*--color-([a-z0-9-]+)\s*:/gm)].map((m) => m[1] as string),
  )

  /**
   * Names that resolve through a non-colour theme namespace, such as the
   * `--text-*` font size scale, or through a Tailwind built-in.
   */
  const builtInNames = new Set([
    // font size scale from --text-*
    "micro",
    "small",
    "body",
    "lead",
    "none",
    // typography
    "pretty",
    "center",
    "left",
    "right",
    "wrap",
    "nowrap",
    "balance",
    "decoration-color",
    "font",
    // borders
    "b",
    "t",
    "r",
    "l",
    "x",
    "y",
    "dashed",
    "solid",
    "y-reverse",
    // layout
    "y",
    "gradient-to-b",
    "full",
    "screen",
    // Tailwind colour keywords
    "transparent",
    "white",
    "black",
    "current",
    "inherit",
    // decoration utilities
    "from-font",
    "transparent",
  ])

  it("parses colour tokens out of globals.css", () => {
    expect(colorTokens.size).toBeGreaterThan(8)
    for (const required of ["page", "surface", "field", "line", "ink", "ink-2", "accent"]) {
      expect(colorTokens).toContain(required)
    }
  })

  it("never references a colour token that does not exist", () => {
    const offenders: string[] = []

    for (const file of collectFiles(ROOT)) {
      if (file === CSS) continue
      if (relative(ROOT, file).split(pathSep).join("/").startsWith("test/")) continue

      const source = readFileSync(file, "utf8")
      const candidates = new Set<string>()

      for (const literal of source.matchAll(/"([^"\n]*)"/g)) {
        for (const token of (literal[1] ?? "").split(/\s+/)) candidates.add(token)
      }
      for (const token of source.matchAll(/`([^`\n]*)`/g)) {
        for (const part of (token[1] ?? "").split(/\s+/)) candidates.add(part)
      }

      for (const token of candidates) {
        const prefix = COLOR_PREFIXES.find((p) => token.startsWith(p))
        if (!prefix) continue

        const name = token.slice(prefix.length)
        if (!name || name.startsWith("[")) continue
        if (/\d/.test(name)) continue
        if (colorTokens.has(name) || builtInNames.has(name)) continue

        offenders.push(`${relative(ROOT, file).replace(/\\/g, "/")}: ${token}`)
      }
    }

    expect(offenders.sort()).toEqual([])
  })
})
