import { connectToDatabase } from "@/lib/db/connect"
import { CategoryModel } from "@/models/category"
import { ToolModel, type ToolDocument } from "@/models/tool"
import { CATEGORIES } from "@/config/categories"
import type {
  SearchDocument,
  SearchHit,
  SearchProvider,
  SearchRequest,
  SearchSuggestion,
} from "./types"

const FIELD_WEIGHTS = {
  name: 12,
  technologies: 5,
  tags: 5,
  bestFor: 4,
  categories: 4,
  integrations: 2,
  description: 2,
} as const

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .split(/[^a-z0-9.+#-]+/)
    .filter(Boolean)

type SearchableTool = Pick<
  ToolDocument,
  | "slug"
  | "name"
  | "description"
  | "categoryIds"
  | "tags"
  | "technologies"
  | "bestFor"
  | "integrations"
>

const toSearchDocument = (
  tool: SearchableTool,
  categoriesById: Map<string, string>,
): SearchDocument => ({
  slug: tool.slug,
  name: tool.name,
  description: tool.description,
  categories: tool.categoryIds
    .map((id) => categoriesById.get(id) ?? "")
    .filter((slug) => slug.length > 0),
  tags: tool.tags,
  technologies: tool.technologies,
  bestFor: tool.bestFor,
  integrations: tool.integrations,
})

const weightedFields = (document: SearchDocument): Array<[number, string[]]> => [
  [FIELD_WEIGHTS.name, [document.name]],
  [FIELD_WEIGHTS.technologies, document.technologies],
  [FIELD_WEIGHTS.tags, document.tags],
  [FIELD_WEIGHTS.bestFor, document.bestFor],
  [FIELD_WEIGHTS.categories, document.categories],
  [FIELD_WEIGHTS.integrations, document.integrations],
  [FIELD_WEIGHTS.description, [document.description]],
]

const scoreDocument = (document: SearchDocument, tokens: string[]): number => {
  let score = 0

  const nameTokens = new Set(tokenize(document.name))
  const nameLower = document.name.toLowerCase()

  for (const token of tokens) {
    let matched = false

    for (const [weight, values] of weightedFields(document)) {
      if (values.length === 0) continue

      const fieldTokens = values.flatMap(tokenize)
      const exact = fieldTokens.includes(token)
      const prefix = fieldTokens.some((value) => value.startsWith(token))

      if (exact) {
        score += weight
        matched = true
      } else if (prefix) {
        score += weight / 2
        matched = true
      }
    }

    if (nameTokens.has(token)) score += FIELD_WEIGHTS.name / 2
    if (nameLower.startsWith(token)) score += FIELD_WEIGHTS.name

    if (!matched) return 0
  }

  if (nameLower === tokens.join(" ")) score += 20

  return score
}

export class FallbackSearchProvider implements SearchProvider {
  readonly name = "fallback"

  private cache: { documents: SearchDocument[]; loadedAt: number } | null = null

  private async loadDocuments(): Promise<SearchDocument[]> {
    if (this.cache && Date.now() - this.cache.loadedAt < 30_000) {
      return this.cache.documents
    }

    await connectToDatabase()

    const [tools, categories] = await Promise.all([
      ToolModel.find({ status: "published" })
        .select({
          slug: 1,
          name: 1,
          description: 1,
          categoryIds: 1,
          tags: 1,
          technologies: 1,
          bestFor: 1,
          integrations: 1,
        })
        .lean<SearchableTool[]>(),
      CategoryModel.find({})
        .select({ _id: 1, slug: 1 })
        .lean<Array<{ _id: string; slug: string }>>(),
    ])

    const categoriesById = new Map(
      categories.map((category) => [String(category._id), category.slug]),
    )
    const documents = tools.map((tool) => toSearchDocument(tool, categoriesById))

    this.cache = { documents, loadedAt: Date.now() }

    return documents
  }

  async search({ query, limit }: SearchRequest): Promise<SearchHit[]> {
    const tokens = tokenize(query)
    if (tokens.length === 0) return []

    const documents = await this.loadDocuments()

    return documents
      .map((document) => ({
        slug: document.slug,
        name: document.name,
        description: document.description,
        score: scoreDocument(document, tokens),
      }))
      .filter((hit) => hit.score > 0)
      .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))
      .slice(0, limit)
  }

  async suggest(prefix: string, limit: number): Promise<SearchSuggestion[]> {
    const normalized = prefix.trim().toLowerCase()
    if (normalized.length === 0) return []

    const documents = await this.loadDocuments()
    const suggestions: SearchSuggestion[] = []

    for (const category of CATEGORIES) {
      if (
        category.slug.startsWith(normalized) ||
        category.name.toLowerCase().startsWith(normalized)
      ) {
        suggestions.push({
          slug: category.slug,
          label: category.name,
          kind: "category",
        })
      }
    }

    for (const document of documents) {
      const nameLower = document.name.toLowerCase()
      const matchesName = nameLower.startsWith(normalized)
      const matchesTag = document.tags.some((tag) => tag.toLowerCase().startsWith(normalized))
      const matchesTechnology = document.technologies.some((technology) =>
        technology.toLowerCase().startsWith(normalized),
      )

      if (matchesName || matchesTag || matchesTechnology) {
        suggestions.push({ slug: document.slug, label: document.name, kind: "tool" })
      }
    }

    return suggestions.slice(0, limit)
  }
}
