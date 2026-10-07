import { cache } from "react"
import { connectToDatabase } from "@/lib/db/connect"
import { CategoryModel } from "@/models/category"
import { ToolModel } from "@/models/tool"
import { NAV_ITEMS } from "@/config/nav"

export type NavCountMap = Map<string, number>

/**
 * Counts for every sidebar row, in one pass: a nav row is keyed by its href,
 * a section row by its `#anchor`.
 *
 * Dedupe is the whole job. A section is the set of distinct published tools in
 * its subcategories; a nav item is the union of its sections' sets. Summing
 * instead would count a tool in two subcategories twice and could report a nav
 * total larger than the directory itself — AGENTS.md 5.3, and the product
 * promise is trust.
 */
export const findNavCounts = cache(async (): Promise<NavCountMap> => {
  await connectToDatabase()

  const [categories, tools] = await Promise.all([
    CategoryModel.find({})
      .select({ _id: 1, slug: 1 })
      .lean<Array<{ _id: unknown; slug: string }>>(),
    ToolModel.find({ status: "published" })
      .select({ _id: 1, categoryIds: 1 })
      .lean<Array<{ _id: unknown; categoryIds: string[] }>>(),
  ])

  const idBySlug = new Map(categories.map((category) => [category.slug, String(category._id)]))

  const toolsByCategoryId = new Map<string, Set<string>>()
  for (const tool of tools) {
    const toolId = String(tool._id)
    for (const categoryId of tool.categoryIds) {
      const bucket = toolsByCategoryId.get(categoryId) ?? new Set<string>()
      bucket.add(toolId)
      toolsByCategoryId.set(categoryId, bucket)
    }
  }

  const counts: NavCountMap = new Map()

  for (const nav of NAV_ITEMS) {
    const navUnion = new Set<string>()

    for (const entry of nav.sections) {
      const sectionSet = new Set<string>()
      for (const subcategory of entry.subcategories) {
        const categoryId = idBySlug.get(subcategory)
        const bucket = categoryId ? toolsByCategoryId.get(categoryId) : undefined
        if (!bucket) continue
        for (const toolId of bucket) sectionSet.add(toolId)
      }
      counts.set(`#${entry.id}`, sectionSet.size)
      for (const toolId of sectionSet) navUnion.add(toolId)
    }

    counts.set(nav.href, navUnion.size)
  }

  return counts
})
