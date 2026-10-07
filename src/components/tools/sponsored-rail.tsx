import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { ToolLogo } from "@/components/tools/tool-logo"
import { PricingBadge } from "@/components/tools/pricing-badge"
import { ExternalIcon } from "@/components/icons"
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
    <section aria-labelledby="sponsored-heading" className="rise mb-6">
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

      <ul className="grid gap-3 sm:grid-cols-2">
        {tools.map((tool) => (
          <li
            key={tool._id}
            className="group flex items-start gap-3 rounded-card border border-brand/25 bg-brand-tint/40 p-4 transition-[transform,border-color,box-shadow] duration-200 ease-ui hover:scale-[1.02] hover:border-brand/50 hover:shadow-lg active:scale-[0.99]"
          >
            <ToolLogo name={tool.name} slug={tool.slug} logoUrl={tool.logoUrl} className="mt-0.5" />

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex min-w-0 items-center gap-2">
                <Link
                  href={`/tools/${tool.slug}`}
                  className="truncate text-body font-semibold text-ink group-hover:text-brand"
                >
                  {tool.name}
                </Link>
                <PricingBadge type={tool.pricing.type} />
              </div>
              <p className="mt-0.5 line-clamp-2 text-small leading-snug text-ink-2">
                {tool.description}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <Badge variant="outline" className="font-mono font-normal">
                  sponsored
                </Badge>
                <a
                  href={tool.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored nofollow"
                  className={buttonVariants({
                    variant: "link",
                    size: "sm",
                    className: "h-auto gap-1 p-0",
                  })}
                >
                  Visit Site
                  <ExternalIcon data-icon="inline-end" />
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
