import { describe, expect, it } from "vitest"
import { SUBCATEGORY_SLUGS } from "@/config/categories"
import { ALL_SECTIONS, NAV_ITEMS, sectionHref } from "@/config/nav"

/*
 * The sidebar, the pages and the redirects all read `src/config/nav.ts`. If a
 * section forgets a subcategory, that section's page silently omits tools the
 * old category pages showed — the kind of quiet regression the product promise
 * (trust, never invent) cannot afford. So: a partition, proven here.
 */
describe("nav config", () => {
  it("claims every subcategory exactly once", () => {
    const claimed = ALL_SECTIONS.flatMap((entry) => entry.section.subcategories)

    expect(new Set(claimed).size).toBe(claimed.length)
    expect([...new Set(claimed)].sort()).toEqual([...SUBCATEGORY_SLUGS].sort())
  })

  it("uses section ids that are unique across every nav item", () => {
    const ids = ALL_SECTIONS.map((entry) => entry.section.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("gives every nav item a route and at least one section", () => {
    const hrefs = NAV_ITEMS.map((nav) => nav.href)
    expect(new Set(hrefs).size).toBe(hrefs.length)
    expect(NAV_ITEMS.every((nav) => nav.sections.length > 0)).toBe(true)
  })

  it("builds cross-page section links that keep the route and the anchor", () => {
    const entry = ALL_SECTIONS[0]
    expect(entry).toBeDefined()
    if (!entry) return

    const href = sectionHref(entry.nav, entry.section.id)
    expect(href).toBe(`${entry.nav.href}#${entry.section.id}`)
  })
})
