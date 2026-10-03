import type { Metadata } from "next"
import { SearchForm } from "@/components/search/search-form"
import { SearchResults } from "@/components/search/search-results"
import { getSearchProvider } from "@/lib/search"
import { SEARCH_LIMITS } from "@/config/constants"

export const metadata: Metadata = {
  title: "Search",
  description: "Search developer tools by name, category, technology or use case.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
}

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = (q ?? "").trim()

  const hits =
    query.length > 0
      ? await getSearchProvider().search({ query, limit: SEARCH_LIMITS.results })
      : []

  return (
    <div>
      <section className="border-b border-dashed border-line py-6">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="numeric text-micro text-ink-3">{hits.length}</span>
          <h1 className="text-lead leading-tight font-bold tracking-tight text-ink">Search</h1>
        </div>
        <p className="mt-1.5 max-w-[62ch] text-body leading-snug text-ink-3">
          Matches names, descriptions, tags, technologies, categories and integrations.
        </p>

        <div className="mt-4 max-w-[36rem]">
          <SearchForm defaultValue={query} />
        </div>
      </section>

      <SearchResults query={query} hits={hits} />
    </div>
  )
}
