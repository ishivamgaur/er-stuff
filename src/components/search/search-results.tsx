import Link from "next/link"
import type { SearchHit } from "@/lib/search/types"

type SearchResultsProps = {
  query: string
  hits: SearchHit[]
}

export const SearchResults = ({ query, hits }: SearchResultsProps) => {
  if (query.length === 0) {
    return (
      <p className="py-8 text-body text-ink-3">
        Start typing to search. Every tool is indexed by name, description, tags, technologies,
        categories and integrations.
      </p>
    )
  }

  if (hits.length === 0) {
    return (
      <div className="py-8">
        <p className="text-body text-ink">
          Nothing matches <span className="text-ink-2">{query}</span>.
        </p>
        <p className="mt-1.5 max-w-[62ch] text-small leading-relaxed text-ink-3">
          Try a shorter query, a technology name such as Postgres or React, or browse a category
          from the sidebar.
        </p>
      </div>
    )
  }

  return (
    <ul className="rule">
      {hits.map((hit, index) => (
        <li key={hit.slug} className="border-b border-dashed border-line last:border-b-0">
          <Link
            href={`/tools/${hit.slug}`}
            className="rise-row flex min-w-0 items-baseline gap-2.5 rounded-control px-2 py-2.5 transition-colors hover:bg-accent"
            style={{ "--d": `${Math.min(index, 11) * 28}ms` } as React.CSSProperties}
          >
            <span className="min-w-0 flex-1 truncate text-body text-ink-3">
              <span className="font-semibold text-ink">{hit.name}</span>
              <span aria-hidden className="px-2 text-ink-4">
                ·
              </span>
              <span>{hit.description}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
