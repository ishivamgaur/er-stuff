import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { IndexGroup } from "@/components/tools/index-row"
import { PageHeader } from "@/components/layout/page-header"
import { Pagination } from "@/components/layout/pagination"
import { connectToDatabase } from "@/lib/db/connect"
import { CategoryModel, type CategoryDocument } from "@/models/category"
import { findTools } from "@/lib/db/tools"
import { toolQuerySchema } from "@/schemas/tool-query"
import { CATEGORIES } from "@/config/categories"

type CategoryPageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const loadCategory = async (
  slug: string,
): Promise<{
  category: CategoryDocument
  parent: CategoryDocument | null
  children: CategoryDocument[]
} | null> => {
  await connectToDatabase()

  const category = await CategoryModel.findOne({ slug }).lean<CategoryDocument | null>()
  if (!category) return null

  const parent = category.parentId
    ? await CategoryModel.findById(category.parentId).lean<CategoryDocument | null>()
    : null

  const children = await CategoryModel.find({ parentId: category._id.toString() })
    .sort({ order: 1 })
    .lean<CategoryDocument[]>()

  return { category, parent, children }
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return CATEGORIES.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await loadCategory(slug)
  if (!result) return { title: "Not found" }

  return {
    title: result.category.name,
    description: result.category.description || `Developer tools in ${result.category.name}.`,
    alternates: { canonical: `/categories/${result.category.slug}` },
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const tree = await loadCategory(slug)

  if (!tree) notFound()

  const { category, parent, children } = tree
  const activeSubcategory = typeof query.subcategory === "string" ? query.subcategory : undefined

  const result = await findTools(
    toolQuerySchema.parse({
      ...query,
      category: [category.slug],
      sort: typeof query.sort === "string" ? query.sort : "popular",
      limit: 48,
    }),
  )

  return (
    <div>
      <PageHeader
        count={result.total}
        title={category.name}
        description={category.description || undefined}
      >
        {parent ? (
          <p className="mb-2 text-small text-ink-3">
            <a href={`/categories/${parent.slug}`} className="hover:text-accent">
              {parent.name}
            </a>
          </p>
        ) : null}

        {children.length > 0 ? (
          <nav aria-label="Sections" className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => {
              const active = activeSubcategory === child.slug
              return (
                <a
                  key={child.slug}
                  href={`/categories/${category.slug}?subcategory=${child.slug}`}
                  aria-current={active ? "true" : undefined}
                  className={`flex items-center gap-2 rounded-chip py-0.5 pr-2 pl-1.5 text-body transition-colors hover:bg-field ${
                    active ? "font-bold text-accent" : "text-ink-2"
                  }`}
                >
                  <span aria-hidden className="w-6 shrink-0 select-none text-ink-4">
                    {active ? "└──" : "├──"}
                  </span>
                  <span className="min-w-0 flex-1 truncate">[{child.name}]</span>
                </a>
              )
            })}
          </nav>
        ) : null}
      </PageHeader>

      <IndexGroup
        title={result.total === 1 ? "1 tool" : `${result.total} tools`}
        tools={result.items}
      />

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        searchParams={query}
        basePath={`/categories/${category.slug}`}
      />
    </div>
  )
}
