import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = join(process.cwd(), "src")

const read = (path: string) => readFileSync(join(ROOT, path), "utf8")

/**
 * D10. The product's claim that rankings are not for sale is enforced in one
 * place, the organic sort map in src/lib/db/tools.ts. If a future change adds
 * `featured` or `sponsored` to that map, the promise is broken and this fails.
 *
 * The reverse also matters: sponsored tools must be fetched by a query that
 * filters on `sponsored` explicitly, not by post filtering the organic list.
 */
describe("D10: ranking never reads featured or sponsored", () => {
  const tools = read("lib/db/tools.ts")

  const sortOptions = tools.slice(tools.indexOf("const SORT_OPTIONS"))

  it("the organic sort map does not mention featured or sponsored", () => {
    const map = sortOptions.slice(0, sortOptions.indexOf("}"))
    expect(map).not.toMatch(/featured/)
    expect(map).not.toMatch(/sponsored/)
  })

  it("no organic query in the repository filters or boosts on sponsored", () => {
    const organic = tools.slice(0, tools.indexOf("export const findSponsoredTools"))
    expect(organic).not.toMatch(/sponsored:\s*true/)
    expect(organic).not.toMatch(/featured:\s*true/)
  })

  it("sponsored tools come from a separate explicitly filtered query", () => {
    const section = tools.slice(tools.indexOf("export const findSponsoredTools"))
    expect(section).toMatch(/sponsored:\s*true/)
    expect(section).toMatch(/status:\s*"published"/)
  })

  it("outbound links from the rail are marked sponsored for search engines", () => {
    const rail = read("components/tools/sponsored-rail.tsx")
    expect(rail).toMatch(/rel="[^"]*sponsored/)
    expect(rail).toMatch(/nofollow/)
  })

  it("the rail renders nothing when there are no sponsors", () => {
    const rail = read("components/tools/sponsored-rail.tsx")
    expect(rail).toMatch(/if \(tools\.length === 0\) return null/)
  })
})
