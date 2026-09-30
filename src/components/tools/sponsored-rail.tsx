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
 * Renders nothing when there are no sponsors. An empty "sponsored" box would be
 * worse than no box, because it implies inventory that does not exist.
 */
export const SponsoredRail = ({ tools }: SponsoredRailProps) => {
  if (tools.length === 0) return null

  return (
    <section aria-labelledby="sponsored-heading" className="mb-2 border border-line bg-field">
      <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-2.5">
        <h2
          id="sponsored-heading"
          className="text-micro font-bold tracking-[0.12em] text-ink-3 uppercase"
        >
          Sponsored
        </h2>
        <a
          href="/sponsors"
          className="text-micro text-ink-4 underline decoration-transparent decoration-from-font underline-offset-[0.3em] transition-colors hover:text-ink-2 hover:decoration-current"
        >
          How this works
        </a>
      </div>

      <ul>
        {tools.map((tool, index) => (
          <li
            key={tool._id}
            className={
              index === tools.length - 1 ? "px-4 py-3.5" : "border-b border-line px-4 py-3.5"
            }
          >
            <div className="flex items-start gap-3 sm:items-center">
              <ToolLogo name={tool.name} slug={tool.slug} logoUrl={tool.logoUrl} />

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex min-w-0 items-baseline gap-2">
                  <a
                    href={`/tools/${tool.slug}`}
                    className="truncate text-body font-bold text-ink underline decoration-transparent decoration-from-font underline-offset-[0.3em] hover:decoration-current"
                  >
                    {tool.name}
                  </a>
                  <PricingBadge type={tool.pricing.type} />
                </div>
                <p className="text-small leading-snug text-pretty text-ink-3">{tool.description}</p>
              </div>

              <a
                href={tool.websiteUrl}
                target="_blank"
                rel="noopener noreferrer sponsored nofollow"
                className="shrink-0 text-small whitespace-nowrap text-accent underline decoration-transparent decoration-from-font underline-offset-[0.3em] hover:decoration-current"
              >
                Visit site
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
