import { connectToDatabase } from "@/lib/db/connect"
import { CategoryModel } from "@/models/category"
import type { CategoryLean } from "./categories"

import { ToolModel, type ToolDocument } from "@/models/tool"
import { toPlainTool, toPlainTools, type PlainTool } from "./plain-tool"
import type { PaginatedResult, ToolQuery } from "@/schemas/tool-query"

export type ToolLean = PlainTool

const SORT_OPTIONS: Record<ToolQuery["sort"], Record<string, 1 | -1>> = {
  popular: { "stats.views": -1 },
  newest: { createdAt: -1 },
  updated: { updatedAt: -1 },
  name: { name: 1 },
}

const resolveCategoryIds = async (query: ToolQuery): Promise<string[]> => {
  const slugs = [...(query.category ?? []), ...(query.subcategory ?? [])]
  if (slugs.length === 0) return []

  const categories = await CategoryModel.find({ slug: { $in: slugs } })
    .select({ _id: 1, path: 1 })
    .lean<Array<{ _id: string; path: string }>>()

  const ids = new Set<string>()
  for (const category of categories) {
    ids.add(category._id)
    const descendants = await CategoryModel.find({ path: { $regex: `^${category.path}\\.` } })
      .select({ _id: 1 })
      .lean<Array<{ _id: string }>>()
    for (const descendant of descendants) ids.add(descendant._id)
  }

  return [...ids]
}

const buildFilter = (query: ToolQuery, categoryIds: string[]) => {
  const conditions: Record<string, unknown>[] = [{ status: "published" }]

  if (query.kind) conditions.push({ kind: query.kind })
  if (categoryIds.length > 0) conditions.push({ categoryIds: { $in: categoryIds } })
  if (query.tag?.length) conditions.push({ tags: { $in: query.tag } })
  if (query.pricing?.length) conditions.push({ "pricing.type": { $in: query.pricing } })
  if (query.freeTier) conditions.push({ "pricing.hasFreeTier": true })
  if (query.openSource) conditions.push({ "openSource.isOpenSource": true })
  if (query.selfHostable) conditions.push({ "capabilities.selfHostable": true })
  if (query.api) conditions.push({ "capabilities.apiAvailable": true })
  if (query.commercialUse) conditions.push({ "capabilities.commercialUse": true })

  return conditions.length > 1 ? { $and: conditions } : (conditions[0] as Record<string, unknown>)
}

export const findTools = async (query: ToolQuery): Promise<PaginatedResult<ToolLean>> => {
  await connectToDatabase()

  const categoryIds = await resolveCategoryIds(query)
  const filter = buildFilter(query, categoryIds)
  const skip = (query.page - 1) * query.limit

  const [items, total] = await Promise.all([
    ToolModel.find(filter)
      .sort(SORT_OPTIONS[query.sort])
      .skip(skip)
      .limit(query.limit)
      .lean<ToolDocument[]>()
      .then(toPlainTools),
    ToolModel.countDocuments(filter),
  ])

  return {
    items,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  }
}

export const findToolBySlug = async (slug: string): Promise<ToolLean | null> => {
  await connectToDatabase()
  const tool = await ToolModel.findOne({ slug, status: "published" }).lean<ToolDocument | null>()
  return tool ? toPlainTool(tool) : null
}

export const findCategoriesBySlugs = async (slugs: string[]): Promise<CategoryLean[]> => {
  await connectToDatabase()
  return CategoryModel.find({ slug: { $in: slugs } }).lean<CategoryLean[]>()
}

export const findCategorySlugsByIds = async (ids: string[]): Promise<string[]> => {
  if (ids.length === 0) return []

  await connectToDatabase()
  const categories = await CategoryModel.find({ _id: { $in: ids } })
    .select({ slug: 1 })
    .lean<Array<{ slug: string }>>()

  return categories.map((category) => category.slug)
}

export const findCategoriesByIds = async (
  ids: string[],
): Promise<Array<{ name: string; slug: string; path: string }>> => {
  if (ids.length === 0) return []

  await connectToDatabase()
  return CategoryModel.find({ _id: { $in: ids } })
    .select({ name: 1, slug: 1, path: 1 })
    .lean<Array<{ name: string; slug: string; path: string }>>()
}

export const findToolsByIds = async (ids: string[]): Promise<ToolLean[]> => {
  if (ids.length === 0) return []

  await connectToDatabase()
  const tools = await ToolModel.find({ _id: { $in: ids }, status: "published" })
    .sort({ name: 1 })
    .lean<ToolDocument[]>()
  return toPlainTools(tools)
}

export const findTotalToolCount = async (): Promise<number> => {
  await connectToDatabase()
  return ToolModel.countDocuments({ status: "published" })
}

/**
 * D10. Sponsored tools are fetched by their own query so that the organic sort
 * never reads `sponsored` or `featured`. If a sponsored tool also appears in
 * the organic list it is because it earned its place, not because it paid.
 */
export const findSponsoredTools = async (limit = 3): Promise<PlainTool[]> => {
  await connectToDatabase()
  const tools = await ToolModel.find({ status: "published", sponsored: true })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean<ToolDocument[]>()
  return toPlainTools(tools)
}
