"use client"

import { useCallback, useRef, useState } from "react"
import { IndexRow } from "@/components/tools/index-row"
import type { PlainTool } from "@/lib/db/plain-tool"

const PREVIEW_WIDTH_REM = 20

const PreviewContent = ({ tool }: { tool: PlainTool }) => (
  <div className="rounded-[10px] bg-page/45 p-5 backdrop-blur-md">
    <div className="overflow-hidden rounded-chip border border-line-strong bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
      {tool.previewImageUrl ? (
        <div className="p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tool.previewImageUrl}
            alt={`Screenshot of ${tool.name}`}
            loading="lazy"
            decoding="async"
            className="preview-image aspect-[16/9] w-full rounded-[3px] border border-line object-cover object-top"
          />
        </div>
      ) : null}

      <div className="border-t border-line p-3">
        <p className="text-body font-bold text-ink">{tool.name}</p>
        <p className="mt-1 line-clamp-2 text-small leading-snug text-ink-2">{tool.description}</p>

        <dl className="mt-2.5 space-y-1">
          {tool.pricing.startingPrice !== null ? (
            <div className="flex justify-between gap-3">
              <dt className="text-micro text-ink-4">from</dt>
              <dd className="text-micro text-ink-2">
                {tool.pricing.startingPrice} {tool.pricing.currency}
              </dd>
            </div>
          ) : null}

          <div className="flex justify-between gap-3">
            <dt className="text-micro text-ink-4">free tier</dt>
            <dd className="text-micro text-ink-2">{tool.pricing.hasFreeTier ? "yes" : "no"}</dd>
          </div>

          <div className="flex justify-between gap-3">
            <dt className="text-micro text-ink-4">self host</dt>
            <dd className="text-micro text-ink-2">
              {tool.capabilities.selfHostable === null
                ? "not verified"
                : tool.capabilities.selfHostable
                  ? "yes"
                  : "no"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
)

type IndexListProps = {
  tools: PlainTool[]
  basePath?: string
}

const PANEL_ESTIMATED_HEIGHT = 400
const VIEWPORT_MARGIN = 16

export const IndexList = ({ tools, basePath = "/tools" }: IndexListProps) => {
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

  return (
    <div className="group/list relative" ref={containerRef} onMouseLeave={handleLeave}>
      {tools.map((tool, index) => (
        <div key={tool.slug} onMouseEnter={(event) => handleEnter(index, event)}>
          <IndexRow tool={tool} basePath={basePath} />
        </div>
      ))}

      {activeTool ? (
        <div
          className="preview-enter pointer-events-none absolute top-0 right-0 z-20 hidden lg:block"
          style={{ top: offsetTop, width: `${PREVIEW_WIDTH_REM}rem` }}
        >
          <PreviewContent tool={activeTool} />
        </div>
      ) : null}
    </div>
  )
}
