export type SearchDocument = {
  slug: string
  name: string
  description: string
  categories: string[]
  tags: string[]
  technologies: string[]
  bestFor: string[]
  integrations: string[]
}

export type SearchHit = {
  slug: string
  name: string
  description: string
  score: number
}

export type SearchSuggestion = {
  slug: string
  label: string
  kind: "tool" | "category" | "utility"
}

export type SearchRequest = {
  query: string
  limit: number
}

export type SearchProvider = {
  readonly name: string
  search(request: SearchRequest): Promise<SearchHit[]>
  suggest(prefix: string, limit: number): Promise<SearchSuggestion[]>
}
