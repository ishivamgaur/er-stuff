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
   * Names that resolve through a different theme namespace, such as the
   * `--text-*` font size scale. Derived from the stylesheet rather than listed,
   * so adding a font size does not mean editing this test.
   */
  const otherNamespaceTokens = new Set(
    [...css.matchAll(/^\s*--(?!color-)([a-z]+)-([a-z0-9-]+)\s*:/gm)].map((m) => m[2] as string),
  )

  /**
   * Tailwind built-ins that are not theme tokens at all.
   *
   * The font-size scale (`xs` through `xl`) resolves from Tailwind's own
   * default theme, not from globals.css, so those names can never be "real
   * tokens" added to the stylesheet. The same holds for the outline-style
   * (`hidden`), background-clip (`clip-padding`) and text-overflow (`ellipsis`,
   * `clip`) keywords that ship with the framework. Only colour names belong in
   * globals.css; framework keywords belong here.
   */
  const builtInNames = new Set([
    // resets
    "none",
    "hidden",
    "clip-padding",
    // typography
    "pretty",
    "center",
    "left",
    "right",
    "wrap",
    "nowrap",
    "balance",
    "ellipsis",
    "clip",
    "xs",
    "sm",
    "base",
    "lg",
    "xl",
    "decoration-color",
    "font",
    "from-font",
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
    "gradient-to-b",
    "full",
    "screen",
    // colour keywords
    "transparent",
    "white",
    "black",
    "current",
    "inherit",
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

        // The trailing `!` important marker and the `/opacity` modifier are not
        // part of the utility name.
        const name = token.slice(prefix.length).replace(/!$/, "").split("/")[0] ?? ""
        if (!name || name.startsWith("[")) continue
        if (/\d/.test(name)) continue
        if (colorTokens.has(name) || otherNamespaceTokens.has(name) || builtInNames.has(name)) {
          continue
        }

        offenders.push(`${relative(ROOT, file).replace(/\\/g, "/")}: ${token}`)
      }
    }

    expect(offenders.sort()).toEqual([])
  })
})

/**
 * The accent is the only hue in the interface, so it carries the legibility
 * burden that used to sit on bright ink. Tokens are swappable through CSS
 * variables, which is exactly why a swap can quietly produce an unreadable
 * link: the utility still exists, the test still passes, only the contrast
 * moved. These pairs are the promise the palette makes in both themes.
 */
describe("sky accent contrast", () => {
  const css = readFileSync(CSS, "utf8")

  /** `:root` holds light, `.dark` follows it, so matches come back in order. */
  const values = (token: string): string[] =>
    [...css.matchAll(new RegExp(`--${token}:\\s*(#[0-9a-fA-F]{6})`, "g"))].map(
      (m) => m[1] as string,
    )

  /** `start` is the channel index in the hex triplet; skip the leading `#`. */
  const channel = (hex: string, start: number): number => {
    const value = parseInt(hex.slice(start + 1, start + 3), 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }

  const luminance = (hex: string): number =>
    0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 2) + 0.0722 * channel(hex, 4)

  const contrast = (a: string, b: string): number => {
    const pair = [luminance(a), luminance(b)].sort((x, y) => y - x)
    const hi = pair[0] ?? 0
    const lo = pair[1] ?? 0
    return (hi + 0.05) / (lo + 0.05)
  }

  const single = (token: string): string[] => {
    const found = values(token)
    expect(found, `--${token} must be defined in both themes`).toHaveLength(2)
    return found
  }

  it("keeps the accent legible on every background it lands on", () => {
    const brand = single("brand")
    const page = single("page")
    const surface = single("surface")
    const sidebar = single("sidebar")
    const brandTint = single("brand-tint")
    const ink = single("ink")

    for (const theme of ["light", "dark"] as const) {
      const i = theme === "light" ? 0 : 1
      expect(
        contrast(brand[i] as string, page[i] as string),
        `${theme} brand on page`,
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        contrast(brand[i] as string, surface[i] as string),
        `${theme} brand on surface`,
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        contrast(brand[i] as string, sidebar[i] as string),
        `${theme} brand on sidebar`,
      ).toBeGreaterThanOrEqual(4.5)
      expect(
        contrast(ink[i] as string, brandTint[i] as string),
        `${theme} ink on tint`,
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

  it("keeps text on the solid accent readable", () => {
    const brandSolid = single("brand-solid")
    const primaryForeground = single("primary-foreground")

    for (const theme of ["light", "dark"] as const) {
      const i = theme === "light" ? 0 : 1
      expect(
        contrast(brandSolid[i] as string, primaryForeground[i] as string),
        `${theme} primary foreground on solid`,
      ).toBeGreaterThanOrEqual(4.5)
    }
  })
})
