import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ToolLogo } from "@/components/tools/tool-logo"
import { PricingBadge } from "@/components/tools/pricing-badge"
import { IndexGroup } from "@/components/tools/index-row"
import { PageHeader } from "@/components/layout/page-header"
import { DetailList, FactPanel } from "@/components/tools/detail-panel"
import { VerifiedState } from "@/components/tools/verified-state"
import { BevelButton } from "@/components/ui/bevel-button"
import { findCategoriesByIds, findToolBySlug, findTools, findToolsByIds } from "@/lib/db/tools"
import { toolQuerySchema } from "@/schemas/tool-query"
import type { PlainTool } from "@/lib/db/plain-tool"

type ToolDetailPageProps = {
  params: Promise<{ slug: string }>
}

const formatDate = (value: Date | string | null): string | null => {
  if (!value) return null

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}

type FactRow = {
  label: string
  value: React.ReactNode
}

const buildFacts = (tool: PlainTool): FactRow[] => {
  const facts: FactRow[] = [
    {
      label: "Free tier",
      value: tool.pricing.hasFreeTier ? (
        <span className="text-ink">yes</span>
      ) : (
        <VerifiedState value={null} trueLabel="yes" falseLabel="no" />
      ),
    },
    {
      label: "Open source",
      value: (
        <VerifiedState
          value={tool.openSource.isOpenSource}
          trueLabel={tool.openSource.license ? `yes, ${tool.openSource.license}` : "yes"}
          falseLabel="no"
        />
      ),
    },
    {
      label: "Self hostable",
      value: (
        <VerifiedState value={tool.capabilities.selfHostable} trueLabel="yes" falseLabel="no" />
      ),
    },
    {
      label: "API",
      value: (
        <VerifiedState value={tool.capabilities.apiAvailable} trueLabel="yes" falseLabel="no" />
      ),
    },
    {
      label: "Commercial use",
      value: (
        <VerifiedState value={tool.capabilities.commercialUse} trueLabel="yes" falseLabel="no" />
      ),
    },
  ]

  if (tool.pricing.startingPrice !== null) {
    facts.push({
      label: "Starting price",
      value: (
        <span className="text-ink">
          {tool.pricing.startingPrice} {tool.pricing.currency}
          {tool.pricing.billingPeriod ? ` / ${tool.pricing.billingPeriod}` : ""}
        </span>
      ),
    })
  }

  if (tool.openSource.githubUrl) {
    facts.push({
      label: "Repository",
      value: (
        <a
          href={tool.openSource.githubUrl}
          rel="noopener noreferrer"
          target="_blank"
          className="text-accent hover:underline"
        >
          GitHub
        </a>
      ),
    })
  }

  return facts
}

const TagGroup = ({ title, items }: { title: string; items: string[] }) => {
  if (items.length === 0) return null

  return (
    <div>
      <p className="text-micro text-ink-4">{title}</p>
      <ul className="mt-1.5 flex flex-wrap gap-x-1.5 gap-y-1">
        {items.map((item) => (
          <li key={item} className="text-small text-ink-2">
            [{item}]
          </li>
        ))}
      </ul>
    </div>
  )
}

export async function generateMetadata({ params }: ToolDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const tool = await findToolBySlug(slug)
  if (!tool) return { title: "Not found" }

  return {
    title: tool.name,
    description: tool.description,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: { title: tool.name, description: tool.description, type: "website" },
  }
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { slug } = await params
  const tool = await findToolBySlug(slug)

  if (!tool) notFound()

  const [categories, alternatives] = await Promise.all([
    findCategoriesByIds(tool.categoryIds),
    findToolsByIds(tool.alternatives),
  ])

  const relatedResult = await findTools(
    toolQuerySchema.parse({
      category: categories.map((category) => category.slug),
      sort: "popular",
      limit: 12,
    }),
  )

  const related = relatedResult.items
    .filter((item) => item.slug !== tool.slug)
    .filter((item) => !tool.alternatives.includes(item._id))

  const verifiedOn = formatDate(tool.verification.lastVerifiedAt)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: tool.websiteUrl,
    applicationCategory: "DeveloperApplication",
    offers: {
      "@type": "Offer",
      price: tool.pricing.startingPrice ?? "0",
      priceCurrency: tool.pricing.currency ?? "USD",
    },
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader title={tool.name} description={tool.description}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <ToolLogo name={tool.name} slug={tool.slug} logoUrl={tool.logoUrl} />
          <PricingBadge type={tool.pricing.type} />

          {categories.map((category) => (
            <a
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="text-small text-ink-3 hover:text-accent"
            >
              [{category.name}]
            </a>
          ))}

          <BevelButton href={tool.websiteUrl} external className="ml-auto">
            Visit site
          </BevelButton>
        </div>
      </PageHeader>

      <section className="border-t border-line py-6">
        <h2 className="text-lead font-bold tracking-tight text-ink">Details</h2>
        <DetailList className="mt-3 max-w-[44rem]" rows={buildFacts(tool)} />

        {tool.pricing.freeTier ? (
          <FactPanel title="pricing.freeTier" className="mt-4">
            {tool.pricing.freeTier.description ?? "A free tier is available."}
            {"\n"}creditCardRequired:{" "}
            <VerifiedState
              value={tool.pricing.freeTier.creditCardRequired}
              trueLabel="true"
              falseLabel="false"
            />
          </FactPanel>
        ) : null}
      </section>

      <section className="border-t border-line py-6">
        <h2 className="text-lead font-bold tracking-tight text-ink">Attributes</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TagGroup title="bestFor" items={tool.bestFor} />
          <TagGroup title="technologies" items={tool.technologies} />
          <TagGroup title="tags" items={tool.tags} />
          <TagGroup title="integrations" items={tool.integrations} />
        </div>
      </section>

      {alternatives.length > 0 ? (
        <IndexGroup
          count={alternatives.length}
          title="Alternatives"
          description="Recorded by an editor, not computed from similarity."
          tools={alternatives}
        />
      ) : null}

      {related.length > 0 ? (
        <IndexGroup
          count={related.length}
          title="Related"
          description="Shares a category, and is not already listed above."
          tools={related}
        />
      ) : null}

      <section className="border-t border-line py-6">
        <h2 className="text-lead font-bold tracking-tight text-ink">Verification</h2>
        <p className="mt-2 max-w-[62ch] text-body text-ink-2">
          {verifiedOn ? (
            <>
              last verified by an editor on <span className="text-ink">{verifiedOn}</span>.
            </>
          ) : (
            "not verified yet. a person has not checked this entry against an official source."
          )}
        </p>
        {tool.verification.status !== "verified" ? (
          <p className="mt-1.5 max-w-[62ch] text-small text-ink-3">
            fields marked not verified are unknown, not false.
          </p>
        ) : null}
      </section>
    </div>
  )
}
