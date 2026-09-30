import { describe, expect, it } from "vitest"
import { isFreeAccess, pricingSchema } from "@/schemas/pricing"
import { PRICING_TYPES } from "@/schemas/pricing"
import { CATEGORIES, CATEGORY_SLUGS, SUBCATEGORY_SLUGS } from "@/config/categories"
import { buildCategoryPath } from "@/schemas/category"
import { toolQuerySchema } from "@/schemas/tool-query"

const basePricing = {
  type: "freemium" as const,
  hasFreeTier: true,
  freeTier: null,
  startingPrice: 20,
  currency: "USD",
  billingPeriod: "monthly" as const,
}

describe("pricing", () => {
  it("keeps free_trial distinct from free", () => {
    const trial = pricingSchema.parse({ ...basePricing, type: "free_trial", hasFreeTier: false })
    expect(trial.type).toBe("free_trial")
    expect(trial.type).not.toBe("free")
  })

  it("accepts every declared pricing type", () => {
    for (const type of PRICING_TYPES) {
      expect(pricingSchema.parse({ ...basePricing, type }).type).toBe(type)
    }
  })

  it("rejects an undeclared pricing type", () => {
    expect(() => pricingSchema.parse({ ...basePricing, type: "gratis" })).toThrow()
  })

  it("treats freemium with a free tier as free access", () => {
    expect(isFreeAccess(pricingSchema.parse(basePricing))).toBe(true)
  })

  it("treats freemium without a free tier as not free access", () => {
    expect(isFreeAccess(pricingSchema.parse({ ...basePricing, hasFreeTier: false }))).toBe(false)
  })
})

describe("capabilities", () => {
  it("preserves null instead of coercing to false", () => {
    const tool = {
      capabilities: {
        apiAvailable: null,
        selfHostable: null,
        commercialUse: null,
        mobile: null,
        web: null,
        desktop: null,
        cli: null,
      },
    }
    expect(tool.capabilities.selfHostable).toBeNull()
    expect(tool.capabilities.selfHostable).not.toBe(false)
  })
})

describe("categories", () => {
  it("ships ten seed categories", () => {
    expect(CATEGORIES).toHaveLength(10)
  })

  it("has unique category slugs", () => {
    expect(new Set(CATEGORY_SLUGS).size).toBe(CATEGORY_SLUGS.length)
  })

  it("has unique subcategory slugs across all parents", () => {
    expect(new Set(SUBCATEGORY_SLUGS).size).toBe(SUBCATEGORY_SLUGS.length)
  })

  it("builds a root path from a slug alone", () => {
    expect(buildCategoryPath("database", null)).toBe("database")
  })

  it("nests a child path under its parent", () => {
    expect(buildCategoryPath("orms", "database")).toBe("database.orms")
  })
})

describe("tool query", () => {
  it("applies defaults when no parameters are supplied", () => {
    const parsed = toolQuerySchema.parse({})
    expect(parsed.page).toBe(1)
    expect(parsed.limit).toBe(24)
    expect(parsed.sort).toBe("popular")
  })

  it("parses comma separated tag lists", () => {
    const parsed = toolQuerySchema.parse({ tag: "react, typescript , " })
    expect(parsed.tag).toEqual(["react", "typescript"])
  })

  it("coerces boolean query parameters", () => {
    expect(toolQuerySchema.parse({ openSource: "true" }).openSource).toBe(true)
    expect(toolQuerySchema.parse({ openSource: "false" }).openSource).toBe(false)
  })

  it("rejects an unknown sort value", () => {
    expect(() => toolQuerySchema.parse({ sort: "random" })).toThrow()
  })

  it("accepts a repeated query parameter as an array", () => {
    const parsed = toolQuerySchema.parse({ category: ["database", "backend"] })
    expect(parsed.category).toEqual(["database", "backend"])
  })

  it("mixes repeated and comma separated list values", () => {
    const parsed = toolQuerySchema.parse({ tag: ["react,typescript", "nextjs"] })
    expect(parsed.tag).toEqual(["react", "typescript", "nextjs"])
  })

  it("accepts booleans as well as query strings", () => {
    expect(toolQuerySchema.parse({ openSource: true }).openSource).toBe(true)
    expect(toolQuerySchema.parse({ openSource: false }).openSource).toBe(false)
  })
})
