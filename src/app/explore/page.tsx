import type { Metadata } from "next"
import { IndexGroup } from "@/components/tools/index-row"
import { PageHeader } from "@/components/layout/page-header"
import { findTools } from "@/lib/db/tools"
import { toolQuerySchema } from "@/schemas/tool-query"

export const metadata: Metadata = {
  title: "Explore",
  description: "Every tool in the directory, on one page.",
  alternates: { canonical: "/explore" },
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = toolQuerySchema.parse({ ...params, limit: 96 })
  const result = await findTools(query)

  return (
    <div>
      <PageHeader
        count={result.total}
        title="Explore"
        description="Every tool in the directory. Narrow it down with Free, or by category."
      />

      <IndexGroup tools={result.items} />
    </div>
  )
}
