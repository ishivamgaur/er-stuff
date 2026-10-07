import Link from "next/link"
import { ToolLogo } from "@/components/tools/tool-logo"
import { PricingBadge } from "@/components/tools/pricing-badge"
import { VerificationMark } from "@/components/tools/verification-mark"
import { IndexList } from "@/components/tools/index-list"
import type { PlainTool } from "@/lib/db/plain-tool"
import { cn } from "@/lib/utils"

type IndexRowProps = {
  tool: PlainTool
  basePath?: string
  index?: number
}

/*
 * One line per tool. Logo, bold name, a dot, and the description truncated to
 * the row on desktop; the pricing badge and verification mark sit in a fixed
 * right column so the description always gets the same measure.
 *
 * Rows arrive staggered through `--d`, capped at twelve steps so a 96-row page
 * does not keep animating while the reader is already scanning.
 */
export const IndexRow = ({ tool, basePath = "/tools", index = 0 }: IndexRowProps) => (
  <div
    className="group/row rise-row flex min-w-0 items-center transition-opacity duration-200 ease-out has-[:focus-visible]:opacity-100 pointer-fine:group-hover/list:opacity-[0.42] pointer-fine:hover:opacity-100"
    style={{ "--d": `${Math.min(index, 11) * 28}ms` } as React.CSSProperties}
  >
    <Link
      href={`${basePath}/${tool.slug}`}
      className="flex min-w-0 flex-1 items-start gap-3 rounded-control px-2 py-2 transition-colors duration-150 group-hover/row:bg-accent active:scale-[0.995] sm:items-center"
    >
      <ToolLogo
        name={tool.name}
        slug={tool.slug}
        logoUrl={tool.logoUrl}
        className="mt-0.5 shrink-0 transition-transform duration-200 ease-ui group-hover/row:scale-110 sm:mt-0"
      />

      <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <span className="flex min-w-0 items-baseline gap-2 sm:contents">
          <span className="truncate text-body leading-snug font-semibold text-ink sm:shrink-0">
            {tool.name}
          </span>
          <span
            aria-hidden
            className="hidden size-[3px] shrink-0 self-center rounded-full bg-input sm:block"
          />
          <span className="flex shrink-0 items-center gap-1.5 sm:hidden">
            {tool.verification.status === "unverified" ? null : (
              <VerificationMark status={tool.verification.status} />
            )}
            <PricingBadge type={tool.pricing.type} />
          </span>
        </span>
        <span className="text-body leading-snug text-pretty text-ink-3 sm:min-w-0 sm:flex-1 sm:truncate">
          {tool.description}
        </span>
      </span>
    </Link>

    <span className="hidden w-28 shrink-0 items-center justify-end gap-2 pr-2 sm:flex">
      {tool.verification.status === "unverified" ? null : (
        <VerificationMark status={tool.verification.status} />
      )}
      <PricingBadge type={tool.pricing.type} />
    </span>
  </div>
)

type IndexGroupProps = {
  /** Anchor id for the sidebar section links and the scroll-spy. */
  id?: string
  count?: number
  title?: string
  description?: string
  tools: PlainTool[]
  basePath?: string
  className?: string
}

/*
 * A section of the index. Separated from its neighbours by a dashed rule and
 * led by its count in mono, so every block answers "how many" before "what".
 *
 * `id` and `data-section` are how the sidebar scroll-spy finds this block:
 * one observer watches every `[data-section]` element and rests the glide box
 * on the section under the reader. `scroll-mt-16` clears the sticky toolbar
 * (and Lenis reads scroll-margin-top when it glides to the anchor).
 */
export const IndexGroup = ({
  id,
  count,
  title,
  description,
  tools,
  basePath = "/tools",
  className,
}: IndexGroupProps) => (
  <section
    {...(id ? { id } : {})}
    {...(id ? { "data-section": id } : {})}
    className={cn("rule scroll-mt-16 py-6", className)}
  >
    {title || count !== undefined ? (
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {count !== undefined ? <span className="numeric text-ink">{count}</span> : null}
        {title ? (
          <h2 className="text-lead leading-snug font-semibold tracking-tight text-ink">{title}</h2>
        ) : null}
        {description ? (
          <p className="w-full min-w-0 text-small leading-relaxed text-pretty text-ink-3 sm:w-auto sm:flex-1 sm:truncate">
            {description}
          </p>
        ) : null}
      </div>
    ) : null}

    <IndexList tools={tools} basePath={basePath} />
  </section>
)
