import { connectToDatabase } from "@/lib/db/connect"
import { CategoryModel, type CategoryDocument } from "@/models/category"
import { ToolModel } from "@/models/tool"

export type CategoryLean = CategoryDocument

export type SectionCount = {
  slug: string
  name: string
  count: number
}

export type CategorySections = {
  slug: string
  sections: SectionCount[]
}

export const findRootCategories = async (): Promise<CategoryLean[]> => {
  await connectToDatabase()
  return CategoryModel.find({ parentId: null, status: "active" })
    .sort({ order: 1 })
    .lean<CategoryLean[]>()
}

const buildCategoryMaps = (categories: CategoryLean[]) => {
  const byId = new Map(categories.map((category) => [String(category._id), category]))
  const childrenByParent = new Map<string, CategoryLean[]>()

  for (const category of categories) {
    if (!category.parentId) continue

    const siblings = childrenByParent.get(category.parentId) ?? []
    siblings.push(category)
    childrenByParent.set(category.parentId, siblings)
  }

  for (const siblings of childrenByParent.values()) {
    siblings.sort((left, right) => left.order - right.order)
  }

  return { byId, childrenByParent }
}

const ancestorPaths = (path: string): string[] => {
  const segments = path.split(".")
  const paths: string[] = []

  for (let depth = 1; depth <= segments.length; depth += 1) {
    paths.push(segments.slice(0, depth).join("."))
  }

  return paths
}

const resolveCounts = async () => {
  await connectToDatabase()

  const [categories, tools] = await Promise.all([
    CategoryModel.find({})
      .select({ _id: 1, slug: 1, path: 1, parentId: 1, order: 1, name: 1 })
      .lean<CategoryLean[]>(),
    ToolModel.find({ status: "published" })
      .select({ categoryIds: 1 })
      .lean<Array<{ categoryIds: string[] }>>(),
  ])

  const pathById = new Map(categories.map((category) => [String(category._id), category.path]))
  const totals = new Map<string, Set<string>>()

  tools.forEach((tool, toolIndex) => {
    const toolId = String(toolIndex)
    const seen = new Set<string>()

    for (const categoryId of tool.categoryIds) {
      const path = pathById.get(categoryId)
      if (!path) continue

      for (const ancestor of ancestorPaths(path)) {
        if (seen.has(ancestor)) continue

        seen.add(ancestor)
        const bucket = totals.get(ancestor) ?? new Set<string>()
        bucket.add(toolId)
        totals.set(ancestor, bucket)
      }
    }
  })

  return { categories, counts: totals }
}

export type ToolCountBySlug = Map<string, number>

export const findCategoryToolCounts = async (): Promise<ToolCountBySlug> => {
  const { categories, counts } = await resolveCounts()

  return new Map(
    categories.map((category) => [category.slug, counts.get(category.path)?.size ?? 0]),
  )
}

export const findCategorySections = async (): Promise<CategorySections[]> => {
  const { categories, counts } = await resolveCounts()
  const { childrenByParent } = buildCategoryMaps(categories)

  return categories
    .filter((category) => !category.parentId)
    .sort((left, right) => left.order - right.order)
    .map((category) => ({
      slug: category.slug,
      sections: (childrenByParent.get(String(category._id)) ?? []).map((child) => ({
        slug: child.slug,
        name: child.name,
        count: counts.get(child.path)?.size ?? 0,
      })),
    }))
}

export const findSectionsForCategory = async (slug: string): Promise<SectionCount[]> => {
  const all = await findCategorySections()
  return all.find((entry) => entry.slug === slug)?.sections ?? []
}
