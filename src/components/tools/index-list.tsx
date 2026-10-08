"use client"

import { useCallback, useRef, useState } from "react"
import { IndexCard, IndexRow } from "@/components/tools/index-row"
import { PricingBadge } from "@/components/tools/pricing-badge"
import { useListView } from "@/components/layout/view-toggle"
import type { ListView } from "@/lib/view"
import type { PlainTool } from "@/lib/db/plain-tool"

const PREVIEW_WIDTH_REM = 20

const PreviewContent = ({ tool }: { tool: PlainTool }) => (
  <div className="rounded-card border border-line bg-surface p-4">
    {tool.previewImageUrl ? (
      <div className="overflow-hidden rounded-chip border border-line">
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
      </div>
    ) : null}

    <div className="mt-2 flex items-center gap-2">
      <p className="min-w-0 flex-1 truncate text-body font-semibold text-ink">{tool.name}</p>
      <PricingBadge type={tool.pricing.type} />
    </div>
    <p className="mt-1 line-clamp-2 text-small leading-snug text-ink-2">{tool.description}</p>

    <dl className="mt-2 space-y-1 border-t border-line pt-2">
      {tool.pricing.startingPrice !== null ? (
        <div className="flex justify-between gap-3">
          <dt className="font-mono text-micro text-ink-4">from</dt>
          <dd className="font-mono text-micro text-ink-2">
            {tool.pricing.startingPrice} {tool.pricing.currency}
          </dd>
        </div>
      ) : null}

      <div className="flex justify-between gap-3">
        <dt className="font-mono text-micro text-ink-4">free tier</dt>
        <dd className="font-mono text-micro text-ink-2">
          {tool.pricing.hasFreeTier ? "yes" : "no"}
        </dd>
      </div>

      <div className="flex justify-between gap-3">
        <dt className="font-mono text-micro text-ink-4">self host</dt>
        <dd className="font-mono text-micro text-ink-2">
          {tool.capabilities.selfHostable === null
            ? "not verified"
            : tool.capabilities.selfHostable
              ? "yes"
              : "no"}
        </dd>
      </div>
    </dl>
  </div>
)

type IndexListProps = {
  tools: PlainTool[]
  basePath?: string
  /** Server-read stored view, so the first paint matches with no flash. */
  initialView?: ListView
}

const PANEL_ESTIMATED_HEIGHT = 380
const VIEWPORT_MARGIN = 16

export const IndexList = ({ tools, basePath = "/tools", initialView }: IndexListProps) => {
  const view = useListView(initialView)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [offsetTop, setOffsetTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleEnter = useCallback((index: number, event: React.MouseEvent) => {
    const container = containerRef.current
    if (!container) return

    const bounds = container.getBoundingClientRect()

    const minByViewport = VIEWPORT_MARGIN - bounds.top
    const maxByViewport = window.innerHeight - PANEL_ESTIMATED_HEIGHT - bounds.top - VIEWPORT_MARGIN

    const min = Math.max(0, minByViewport)
    const max = Math.max(min, Math.min(bounds.height - PANEL_ESTIMATED_HEIGHT, maxByViewport))

    const desired = event.clientY - bounds.top - 24

    setOffsetTop(Math.min(Math.max(desired, min), max))
    setActiveIndex(index)
  }, [])

  const handleLeave = useCallback(() => {
    setActiveIndex(null)
  }, [])

  const activeTool = activeIndex === null ? null : (tools[activeIndex] ?? null)

  // Cards need no hover preview: the tile already shows what the preview
  // would — name, description, pricing — so the pointer tracking stays off.
  // gap-5, not gap-4: every tile wears the roomy rim, whose outline stands
  // 3px proud, and a wide tile wants visibly more air outside than the 14px
  // it keeps inside.
  if (view === "cards") {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        {tools.map((tool, index) => (
          <IndexCard key={tool.slug} tool={tool} basePath={basePath} index={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="group/list relative" ref={containerRef} onMouseLeave={handleLeave}>
      {tools.map((tool, index) => (
        <div
          key={tool.slug}
          onMouseEnter={(event) => handleEnter(index, event)}
          className="border-b border-dashed border-line last:border-b-0"
        >
          <IndexRow tool={tool} basePath={basePath} index={index} />
        </div>
      ))}

      {activeTool ? (
        <div
          className="pointer-events-none absolute top-0 right-0 z-20 hidden lg:block"
          style={{ top: offsetTop, width: `${PREVIEW_WIDTH_REM}rem` }}
        >
          <PreviewContent tool={activeTool} />
        </div>
      ) : null}
    </div>
  )
}
