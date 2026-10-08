import Link from "next/link"
import { ToolLogo } from "@/components/tools/tool-logo"
import { PricingBadge } from "@/components/tools/pricing-badge"
import { VerificationMark } from "@/components/tools/verification-mark"
import { IndexList } from "@/components/tools/index-list"
import type { ListView } from "@/lib/view"
import type { PlainTool } from "@/lib/db/plain-tool"
import { cn } from "@/lib/utils"

type IndexRowProps = {
  tool: PlainTool
  basePath?: string
  index?: number
}

/*
 * One line per tool. Logo, bold name and the description truncated to the row
 * on desktop; the pricing badge and verification mark sit in a fixed right
 * column so the description always gets the same measure. Name and description
 * share one baseline with only a gap between them — colour does the separating,
 * semibold ink against quiet ink-3, so there is no dot or meta punctuation.
 *
 * Hover is type only, like the sidebar: the name takes the brand, the
 * description lifts one step, siblings dim, and the preview follows the
 * pointer. No row paints a fill.
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
      className="flex min-w-0 flex-1 items-start gap-2.5 py-1.5 active:scale-[0.995] sm:items-center"
    >
      <ToolLogo
        name={tool.name}
        slug={tool.slug}
        logoUrl={tool.logoUrl}
        className="mt-0.5 shrink-0 sm:mt-0"
      />

      <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <span className="flex min-w-0 items-baseline gap-2 sm:contents">
          <span className="truncate text-body leading-snug font-semibold text-ink transition-colors duration-150 ease-ui group-hover/row:text-brand sm:shrink-0">
            {tool.name}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 sm:hidden">
            {tool.verification.status === "unverified" ? null : (
              <VerificationMark status={tool.verification.status} />
            )}
            <PricingBadge type={tool.pricing.type} />
          </span>
        </span>
        <span className="text-body leading-snug text-pretty text-ink-3 transition-colors duration-150 ease-ui group-hover/row:text-ink-2 sm:min-w-0 sm:flex-1 sm:truncate">
          {tool.description}
        </span>
      </span>
    </Link>

    <span className="hidden w-28 shrink-0 items-center justify-end gap-2 sm:flex">
      {tool.verification.status === "unverified" ? null : (
        <VerificationMark status={tool.verification.status} />
      )}
      <PricingBadge type={tool.pricing.type} />
    </span>
  </div>
)

/*
 * The same tool as a card, for the cards view. Screenshot on top, favicon
 * beside the name: the tile reads as the site itself at a glance. Quiet by
 * house rules otherwise: a plain bordered tile, no shadow, no lift, no
 * scale — the name takes the brand on hover and the border steps up one
 * token, exactly like a row would.
 */
export const IndexCard = ({ tool, basePath = "/tools", index = 0 }: IndexRowProps) => (
  <Link
    href={`${basePath}/${tool.slug}`}
    className="rise-row group flex min-w-0 flex-col overflow-hidden rounded-card border border-line rim-roomy transition-colors duration-150 ease-ui hover:border-line-strong active:scale-[0.99]"
    style={{ "--d": `${Math.min(index, 11) * 28}ms` } as React.CSSProperties}
  >
    {tool.previewImageUrl ? (
      <span className="block aspect-[16/9] w-full overflow-hidden border-b border-line bg-surface">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tool.previewImageUrl}
          alt={`Screenshot of ${tool.name}`}
          width={880}
          height={495}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top"
        />
      </span>
    ) : null}
    <span className="flex min-w-0 flex-col gap-1.5 p-3.5">
      <span className="flex min-w-0 items-center gap-2">
        <ToolLogo name={tool.name} slug={tool.slug} logoUrl={tool.logoUrl} />
        <span className="min-w-0 flex-1 truncate text-body font-semibold text-ink transition-colors duration-150 ease-ui group-hover:text-brand">
          {tool.name}
        </span>
        {tool.verification.status === "unverified" ? null : (
          <VerificationMark status={tool.verification.status} />
        )}
        <PricingBadge type={tool.pricing.type} />
      </span>
      <span className="line-clamp-2 min-w-0 text-small leading-snug text-ink-3">
        {tool.description}
      </span>
    </span>
  </Link>
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
  /** Server-read stored view, so the first paint matches with no flash. */
  initialView?: ListView
}

/*
 * A section of the index. Separated from its neighbours by a dashed rule and
 * led by its count in mono, so every block answers "how many" before "what".
 * An empty section renders nothing at all: a heading with a zero under it
 * reads as a broken fetch, and the sidebar hides it the same way, so the two
 * can never disagree about which anchors exist.
 *
 * `id` and `data-section` are how the sidebar scroll-spy finds this block:
 * one observer watches every `[data-section]` element and marks the section
 * under the reader. `scroll-mt-16` clears the sticky toolbar
 * (and Lenis reads scroll-margin-top when it glides to the anchor).
 */
export const IndexGroup = ({
  id,
  count,
  title,
  tools,
  basePath = "/tools",
  className,
  initialView,
}: IndexGroupProps) => {
  if (tools.length === 0) return null

  return (
    <section
      {...(id ? { id } : {})}
      {...(id ? { "data-section": id } : {})}
      className={cn("rule scroll-mt-16 py-5", className)}
    >
      {title || count !== undefined ? (
        <div className="mb-3 flex items-baseline gap-x-2">
          {count !== undefined ? (
            <span className="numeric shrink-0 text-micro text-brand">{count}</span>
          ) : null}
          {title ? <h2 className="shrink-0 text-small font-medium text-ink-2">{title}</h2> : null}
        </div>
      ) : null}

      <IndexList tools={tools} basePath={basePath} {...(initialView ? { initialView } : {})} />
    </section>
  )
}
