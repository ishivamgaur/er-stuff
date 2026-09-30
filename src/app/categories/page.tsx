import type { Metadata } from "next"
import { PageHeader } from "@/components/layout/page-header"
import { findCategorySections, findCategoryToolCounts } from "@/lib/db/categories"
import { findTotalToolCount } from "@/lib/db/tools"
import { CATEGORIES } from "@/config/categories"

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Every category in the directory, from design and frontend to hosting, deployment and AI.",
  alternates: { canonical: "/categories" },
}

export default async function CategoriesPage() {
  const [tree, counts, total] = await Promise.all([
    findCategorySections(),
    findCategoryToolCounts(),
    findTotalToolCount(),
  ])
  const descriptionBySlug = new Map(
    CATEGORIES.map((category) => [category.slug, category.description]),
  )
  const sectionTotal = tree.reduce((sum, entry) => sum + entry.sections.length, 0)

  return (
    <div>
      <PageHeader
        count={tree.length}
        title="Categories"
        description={`${total} tools across ${sectionTotal} sections. Counts include every tool in that section and its subsections.`}
      />

      <ul className="divide-y divide-line">
        {tree.map((entry) => (
          <li key={entry.slug} className="py-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="w-8 shrink-0 text-right text-body tabular-nums text-ink-4">
                {counts.get(entry.slug) ?? 0}
              </span>
              <a
                href={`/categories/${entry.slug}`}
                className="text-body font-bold text-ink hover:text-accent"
              >
                {entry.slug}
              </a>
              <span className="w-full min-w-0 text-small text-pretty text-ink-3 sm:w-auto sm:flex-1 sm:truncate">
                {descriptionBySlug.get(entry.slug)}
              </span>
            </div>

            {entry.sections.length > 0 ? (
              <ul className="mt-2 ml-11 flex flex-wrap gap-x-4 gap-y-1">
                {entry.sections.map((section) => (
                  <li key={section.slug} className="flex items-baseline gap-1.5">
                    <a
                      href={`/categories/${entry.slug}?subcategory=${section.slug}`}
                      className="text-small text-ink-2 hover:text-accent"
                    >
                      {section.name}
                    </a>
                    <span className="text-micro tabular-nums text-ink-4">{section.count}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
