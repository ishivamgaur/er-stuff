import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ToolLogo } from "@/components/tools/tool-logo"
import { PricingBadge } from "@/components/tools/pricing-badge"
import { IndexGroup } from "@/components/tools/index-row"
import { VerifiedState } from "@/components/tools/verified-state"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExternalIcon, InfoIcon } from "@/components/icons"
import { findCategoriesByIds, findToolBySlug, findTools, findToolsByIds } from "@/lib/db/tools"
import { findSectionForSubcategory, sectionHref } from "@/config/nav"
import { toolQuerySchema } from "@/schemas/tool-query"
import type { PlainTool } from "@/lib/db/plain-tool"

type ToolDetailPageProps = {
  params: Promise<{ slug: string }>
}

/*
 * A tool's category chips link to the section that now owns the subcategory,
 * not to the removed /categories routes. A category no section claims (there
 * should be none) renders as plain text rather than a link that 404s.
 */
const sectionHrefFromSubcategory = (slug: string): string | null => {
  const owner = findSectionForSubcategory(slug)
  return owner ? sectionHref(owner.nav, owner.section.id) : null
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

/*
 * Prices render through Intl, never as a glued string. An unknown currency
 * code throws, so it falls back to the raw number rather than failing the
 * whole page.
 */
const formatPrice = (value: number, currency: string | null): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency ?? "USD",
    }).format(value)
  } catch {
    return currency ? `${value} ${currency}` : String(value)
  }
}

const buildFacts = (tool: PlainTool): FactRow[] => {
  const facts: FactRow[] = [
    {
      label: "pricing.type",
      value: <PricingBadge type={tool.pricing.type} />,
    },
    {
      label: "pricing.freeTier",
      value: tool.pricing.hasFreeTier ? (
        <span className="font-medium text-ink">yes</span>
      ) : (
        <VerifiedState value={null} trueLabel="yes" falseLabel="no" />
      ),
    },
    {
      label: "openSource",
      value: (
        <VerifiedState
          value={tool.openSource.isOpenSource}
          trueLabel={tool.openSource.license ? `yes, ${tool.openSource.license}` : "yes"}
          falseLabel="no"
        />
      ),
    },
    {
      label: "capabilities.selfHostable",
      value: (
        <VerifiedState value={tool.capabilities.selfHostable} trueLabel="yes" falseLabel="no" />
      ),
    },
    {
      label: "capabilities.apiAvailable",
      value: (
        <VerifiedState value={tool.capabilities.apiAvailable} trueLabel="yes" falseLabel="no" />
      ),
    },
    {
      label: "capabilities.commercialUse",
      value: (
        <VerifiedState value={tool.capabilities.commercialUse} trueLabel="yes" falseLabel="no" />
      ),
    },
  ]

  if (tool.pricing.startingPrice !== null) {
    facts.push({
      label: "pricing.startingPrice",
      value: (
        <span className="numeric text-body font-semibold text-ink">
          {formatPrice(tool.pricing.startingPrice, tool.pricing.currency)}
          {tool.pricing.billingPeriod ? ` / ${tool.pricing.billingPeriod}` : ""}
        </span>
      ),
    })
  }

  if (tool.openSource.githubUrl) {
    facts.push({
      label: "openSource.githubUrl",
      value: (
        <a
          href={tool.openSource.githubUrl}
          rel="noopener noreferrer"
          target="_blank"
          className="font-medium text-brand hover:underline"
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
      <p className="label text-ink-4">{title}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li key={item}>
            <Badge
              variant="secondary"
              className="rounded-chip font-normal transition-transform duration-150 ease-ui hover:scale-105 active:scale-95"
            >
              {item}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  )
}

const hostOf = (url: string): string => {
  try {
    return new URL(url).host
  } catch {
    return url
  }
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

  const firstCategory = categories[0]
  const firstCategoryHref = firstCategory ? sectionHrefFromSubcategory(firstCategory.slug) : null

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

      <nav
        aria-label="Breadcrumb"
        className="rise mb-5 flex items-center gap-2 font-mono text-micro text-ink-4"
      >
        <Link href="/" className="transition-colors hover:text-brand">
          index
        </Link>
        <span aria-hidden>/</span>
        {firstCategory && firstCategoryHref ? (
          <>
            <Link href={firstCategoryHref} className="transition-colors hover:text-brand">
              {firstCategory.name}
            </Link>
            <span aria-hidden>/</span>
          </>
        ) : null}
        <span className="truncate text-ink-3">{tool.slug}</span>
      </nav>

      <header className="rise mb-6">
        <div className="flex items-start gap-4">
          <ToolLogo
            name={tool.name}
            slug={tool.slug}
            logoUrl={tool.logoUrl}
            className="size-12 shrink-0 rounded-[10px] border border-line"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-display leading-tight font-semibold tracking-tight text-balance text-ink">
              {tool.name}
            </h1>
            <p className="mt-1.5 max-w-[60ch] text-lead leading-relaxed text-pretty text-ink-2">
              {tool.description}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <PricingBadge type={tool.pricing.type} />
          {tool.verification.status === "verified" ? (
            <Badge className="rounded-chip font-mono font-medium">verified</Badge>
          ) : (
            <Badge variant="secondary" className="rounded-chip font-mono font-normal">
              not verified
            </Badge>
          )}
          {categories.map((category) => {
            const href = sectionHrefFromSubcategory(category.slug)
            if (!href) return null
            return (
              <Link
                key={category.slug}
                href={href}
                className="rounded-chip border border-line bg-surface px-2 py-0.5 text-small text-ink-2 transition-all duration-150 ease-ui hover:scale-105 hover:border-brand/40 hover:text-ink"
              >
                {category.name}
              </Link>
            )
          })}

          <span className="ml-auto flex items-center gap-2">
            {tool.openSource.githubUrl ? (
              <a
                href={tool.openSource.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline" })}
              >
                GitHub
              </a>
            ) : null}
            <a
              href={tool.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ className: "gap-1.5" })}
            >
              Visit Site
              <ExternalIcon data-icon="inline-end" />
            </a>
          </span>
        </div>
      </header>

      {tool.previewImageUrl ? (
        <div className="rule py-6">
          <figure className="overflow-hidden rounded-card border border-line bg-surface shadow-xl dark:shadow-none dark:ring-1 dark:ring-white/10">
            <div className="flex items-center gap-2 border-b border-line px-3.5 py-2.5">
              <span aria-hidden className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-line-strong" />
                <span className="size-2.5 rounded-full bg-line-strong" />
                <span className="size-2.5 rounded-full bg-brand" />
              </span>
              <span className="ml-1 min-w-0 flex-1 truncate rounded-chip bg-field px-2.5 py-1 font-mono text-micro text-ink-3">
                {hostOf(tool.websiteUrl)}
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tool.previewImageUrl}
              alt={`Screenshot of ${tool.name}`}
              width={880}
              height={495}
              loading="lazy"
              decoding="async"
              className="aspect-[16/9] w-full object-cover object-top"
            />
          </figure>
        </div>
      ) : null}

      <div className="rule py-6">
        <section>
          <h2 className="label text-ink-4">Details</h2>
          <dl className="mt-1">
            {buildFacts(tool).map((fact, index) => (
              <div
                key={fact.label}
                className={
                  index === 0
                    ? "grid grid-cols-[10rem_minmax(0,1fr)] items-baseline gap-x-4 py-3"
                    : "grid grid-cols-[10rem_minmax(0,1fr)] items-baseline gap-x-4 border-t border-dashed border-line py-3"
                }
              >
                <dt className="truncate font-mono text-micro text-ink-4">{fact.label}</dt>
                <dd className="min-w-0 text-body text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>

          {tool.pricing.freeTier ? (
            <div className="mt-3 rounded-card border border-brand/25 bg-brand-tint/40 px-4 py-3">
              <p className="label text-brand">pricing.freeTier</p>
              <p className="mt-1.5 text-small leading-relaxed whitespace-pre-wrap text-ink-2">
                {tool.pricing.freeTier.description ?? "A free tier is available."}
                {"\n"}creditCardRequired:{" "}
                <VerifiedState
                  value={tool.pricing.freeTier.creditCardRequired}
                  trueLabel="true"
                  falseLabel="false"
                />
              </p>
            </div>
          ) : null}
        </section>
      </div>

      <div className="rule py-6">
        <section>
          <h2 className="label text-ink-4">Attributes</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <TagGroup title="bestFor" items={tool.bestFor} />
            <TagGroup title="technologies" items={tool.technologies} />
            <TagGroup title="tags" items={tool.tags} />
            <TagGroup title="integrations" items={tool.integrations} />
          </div>
        </section>
      </div>

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

      <div className="rule py-6">
        <section>
          <h2 className="label mb-3 text-ink-4">Verification</h2>
          <Alert>
            <InfoIcon />
            <AlertTitle>{verifiedOn ? "Verified" : "Not Verified Yet"}</AlertTitle>
            <AlertDescription>
              {verifiedOn
                ? `Checked against an official source by a person on ${verifiedOn}.`
                : "A person has not checked this entry against an official source. Fields marked not verified are unknown, not false."}
            </AlertDescription>
          </Alert>
        </section>
      </div>
    </div>
  )
}
