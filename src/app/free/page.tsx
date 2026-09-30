import type { Metadata } from "next"
import { IndexGroup } from "@/components/tools/index-row"
import { PageHeader } from "@/components/layout/page-header"
import { findTools } from "@/lib/db/tools"
import { toolQuerySchema } from "@/schemas/tool-query"

export const metadata: Metadata = {
  title: "Free developer tools",
  description:
    "Developer tools that are free forever, offer a free tier, are open source, or can be self hosted.",
  alternates: { canonical: "/free" },
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function FreePage({ searchParams }: PageProps) {
  const params = await searchParams
  const result = await findTools(toolQuerySchema.parse({ ...params, limit: 96 }))

  const freeForever = result.items.filter((tool) => tool.pricing.type === "free")
  const freeTier = result.items.filter(
    (tool) => tool.pricing.type === "freemium" && tool.pricing.hasFreeTier,
  )
  const openSource = result.items.filter((tool) => tool.openSource.isOpenSource === true)
  const selfHostable = result.items.filter((tool) => tool.capabilities.selfHostable === true)

  const freeCount = freeForever.length + freeTier.length + openSource.length + selfHostable.length

  return (
    <div>
      <PageHeader
        count={freeCount}
        title="Free"
        description="Grouped by what free actually means. A free trial is never counted as free forever."
      />

      <IndexGroup
        count={freeForever.length}
        title="Free forever"
        description="No trial, no card, no expiry."
        tools={freeForever}
      />

      <IndexGroup
        count={freeTier.length}
        title="Free tier"
        description="A limited free plan. Credit card requirement is listed per tool."
        tools={freeTier}
      />

      <IndexGroup
        count={openSource.length}
        title="Open source"
        description="Source available, with the licence recorded where known."
        tools={openSource}
      />

      <IndexGroup
        count={selfHostable.length}
        title="Self hostable"
        description="You can run it yourself. Infrastructure cost is not included."
        tools={selfHostable}
      />
    </div>
  )
}
