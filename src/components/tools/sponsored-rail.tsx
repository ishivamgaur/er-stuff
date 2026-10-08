import Link from "next/link"
import { ToolLogo } from "@/components/tools/tool-logo"
import { PricingBadge } from "@/components/tools/pricing-badge"
import type { PlainTool } from "@/lib/db/plain-tool"

type SponsoredRailProps = {
  tools: PlainTool[]
}

/**
 * The one place a vendor can pay to appear. D10: this is a separate query and a
 * separate visual rail, so the organic list below is untouched by it.
 *
 * The rail speaks the same language as the organic list — one line per tool,
 * dashed rules between rows — with a mono `sponsored` annotation doing the
 * labelling instead of a tinted card. State pays for position, not for a
 * louder surface.
 *
 * Renders nothing when there are no sponsors. An empty "sponsored" box would be
 * worse than no box, because it implies inventory that does not exist.
 */
export const SponsoredRail = ({ tools }: SponsoredRailProps) => {
  if (tools.length === 0) return null

  return (
    <section aria-labelledby="sponsored-heading" className="rise mb-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id="sponsored-heading" className="label text-ink-4">
          Sponsored
        </h2>
        <Link
          href="/sponsors"
          className="text-small text-ink-3 underline decoration-transparent underline-offset-4 transition-colors hover:text-brand hover:decoration-current"
        >
          How This Works
        </Link>
      </div>

      <ul>
        {tools.map((tool) => (
          <li key={tool._id} className="border-b border-dashed border-line last:border-b-0">
            <div className="group flex min-w-0 items-center gap-2.5 py-1.5">
              <Link
                href={`/tools/${tool.slug}`}
                className="flex min-w-0 flex-1 items-start gap-2.5 active:scale-[0.995] sm:items-center"
              >
                <ToolLogo
                  name={tool.name}
                  slug={tool.slug}
                  logoUrl={tool.logoUrl}
                  className="mt-0.5 shrink-0 sm:mt-0"
                />

                <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-2">
                  <span className="flex min-w-0 items-baseline gap-2 sm:contents">
                    <span className="truncate text-body leading-snug font-semibold text-ink transition-colors duration-150 ease-ui group-hover:text-brand sm:shrink-0">
                      {tool.name}
                    </span>
                    <span className="shrink-0 font-mono text-micro text-ink-4">sponsored</span>
                    <span className="flex shrink-0 items-center sm:hidden">
                      <PricingBadge type={tool.pricing.type} />
                    </span>
                  </span>
                  <span className="text-body leading-snug text-pretty text-ink-3 transition-colors duration-150 ease-ui group-hover:text-ink-2 sm:min-w-0 sm:flex-1 sm:truncate">
                    {tool.description}
                  </span>
                </span>
              </Link>

              <span className="hidden w-28 shrink-0 items-center justify-end gap-2 sm:flex">
                <a
                  href={tool.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored nofollow"
                  className="font-mono text-micro text-ink-3 transition-colors duration-150 ease-ui hover:text-brand"
                >
                  visit site
                </a>
                <PricingBadge type={tool.pricing.type} />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
