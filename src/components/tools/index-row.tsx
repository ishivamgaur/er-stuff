import Link from "next/link"
import { ToolLogo } from "@/components/tools/tool-logo"
import { PricingBadge } from "@/components/tools/pricing-badge"
import { VerificationMark } from "@/components/tools/verification-mark"
import { IndexList } from "@/components/tools/index-list"
import type { PlainTool } from "@/lib/db/plain-tool"

type IndexRowProps = {
  tool: PlainTool
  basePath?: string
}

export const IndexRow = ({ tool, basePath = "/tools" }: IndexRowProps) => (
  <div className="group/row flex min-w-0 items-center rounded-chip transition-opacity duration-200 ease-out has-[:focus-visible]:opacity-100 pointer-fine:group-hover/list:opacity-[0.42] pointer-fine:hover:opacity-100">
    <Link
      href={`${basePath}/${tool.slug}`}
      className="flex min-w-0 flex-1 items-start gap-2.5 py-2 pr-2.5 pl-2.5 underline decoration-transparent decoration-from-font underline-offset-[0.3em] transition-[text-decoration-color,background-color] duration-150 group-hover/row:decoration-current group-focus-visible/row:decoration-current group-hover/row:bg-field active:scale-[0.995] sm:items-center"
    >
      <ToolLogo
        name={tool.name}
        slug={tool.slug}
        logoUrl={tool.logoUrl}
        className="mt-0.5 shrink-0 sm:mt-0"
      />

      <span className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <span className="flex min-w-0 items-baseline gap-2 sm:contents">
          <span className="truncate text-body leading-snug font-bold text-ink sm:shrink-0">
            {tool.name}
          </span>
          <span
            aria-hidden
            className="hidden size-[3px] shrink-0 self-center rounded-full bg-line-strong sm:block"
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

    <span className="hidden w-[6.5rem] shrink-0 items-center justify-end gap-2 pr-2.5 sm:flex">
      {tool.verification.status === "unverified" ? null : (
        <VerificationMark status={tool.verification.status} />
      )}
      <PricingBadge type={tool.pricing.type} />
    </span>
  </div>
)

type IndexGroupProps = {
  count?: number
  title?: string
  description?: string
  tools: PlainTool[]
  basePath?: string
}

export const IndexGroup = ({
  count,
  title,
  description,
  tools,
  basePath = "/tools",
}: IndexGroupProps) => (
  <section className="border-b border-line py-6 last:border-b-0">
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      {count !== undefined ? (
        <span className="text-lead leading-tight font-bold tabular-nums text-ink">{count}</span>
      ) : null}
      {title ? (
        <h2 className="text-lead leading-tight font-bold tracking-tight text-ink">{title}</h2>
      ) : null}
      {description ? (
        <p className="w-full min-w-0 text-small text-pretty text-ink-3 sm:w-auto sm:flex-1 sm:truncate">
          {description}
        </p>
      ) : null}
    </div>

    <div className="mt-3">
      <IndexList tools={tools} basePath={basePath} />
    </div>
  </section>
)
